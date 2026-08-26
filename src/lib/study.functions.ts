import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAIProvider } from "@/lib/ai/registry.server";
import { buildContextBlock, parseJsonBlock } from "@/lib/ai/prompts";

// ---------------------------------------------------------------------------
// Question generator
// ---------------------------------------------------------------------------
const genInput = z.object({
  subjectId: z.string().uuid().nullable().optional(),
  topic: z.string().max(200).optional(),
  count: z.number().int().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum(["mcq", "short", "long", "application"]),
  persist: z.boolean().optional(),
});

export interface GeneratedQuestion {
  id?: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  topic: string;
}

async function retrieveContext(
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> },
  query: string,
  subjectId?: string | null,
  count = 8,
) {
  const provider = getAIProvider();
  const { vectors } = await provider.embed([query]);
  const { data } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(vectors[0] ?? []),
    match_count: count,
    p_subject_id: subjectId ?? undefined,
  });
  return (data ?? []) as {
    source_label: string;
    page_number: number | null;
    content: string;
    similarity: number;
  }[];
}

export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => genInput.parse(data))
  .handler(async ({ data, context }): Promise<{ questions: GeneratedQuestion[] }> => {
    const { supabase, userId } = context;
    const query = data.topic?.trim() || "key examinable concepts from this subject";
    const chunks = await retrieveContext(supabase as never, query, data.subjectId, 10);
    const provider = getAIProvider();

    const shape =
      data.questionType === "mcq"
        ? `{"question_text":string,"options":[4 strings],"correct_answer":string (must equal one option),"explanation":string,"topic":string}`
        : `{"question_text":string,"options":null,"correct_answer":string (model answer),"explanation":string,"topic":string}`;

    const { text } = await provider.complete({
      messages: [
        {
          role: "system",
          content:
            "You write university exam questions. Base them on the provided study material when available. " +
            `Return ONLY a JSON array of ${data.count} objects of shape ${shape}. No prose, no markdown fences.`,
        },
        {
          role: "user",
          content: `Difficulty: ${data.difficulty}. Type: ${data.questionType}. Focus: ${query}.\n\nStudy material:\n${buildContextBlock(chunks)}`,
        },
      ],
      temperature: 0.7,
      maxOutputTokens: 2600,
    });

    const parsed = parseJsonBlock<GeneratedQuestion[]>(text) ?? [];
    const questions = parsed.slice(0, data.count).map((q) => ({
      question_text: String(q.question_text ?? ""),
      options: Array.isArray(q.options) ? q.options.map(String) : null,
      correct_answer: String(q.correct_answer ?? ""),
      explanation: String(q.explanation ?? ""),
      topic: String(q.topic ?? data.topic ?? "General"),
    }));

    if (data.persist && questions.length) {
      await supabase.from("questions").insert(
        questions.map((q) => ({
          user_id: userId,
          subject_id: data.subjectId ?? null,
          question_text: q.question_text,
          question_type: data.questionType,
          difficulty: data.difficulty,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })) as never,
      );
    }

    return { questions };
  });

// ---------------------------------------------------------------------------
// Mistake explainer
// ---------------------------------------------------------------------------
const mistakeInput = z.object({
  question: z.string().min(2).max(2000),
  studentAnswer: z.string().max(2000),
  correctAnswer: z.string().max(2000),
  subjectId: z.string().uuid().nullable().optional(),
});

export interface MistakeReport {
  whyWrong: string;
  conceptToReview: string;
  recommendedPractice: string;
  sources: string[];
}

export const explainMistake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => mistakeInput.parse(data))
  .handler(async ({ data, context }): Promise<MistakeReport> => {
    const chunks = await retrieveContext(
      context.supabase as never,
      `${data.question} ${data.correctAnswer}`,
      data.subjectId,
      6,
    );
    const provider = getAIProvider();
    const { text } = await provider.complete({
      messages: [
        {
          role: "system",
          content:
            "You are a supportive exam coach. Diagnose the student's mistake. Return ONLY JSON: " +
            `{"whyWrong":string,"conceptToReview":string,"recommendedPractice":string}`,
        },
        {
          role: "user",
          content: `Question: ${data.question}\nStudent answer: ${data.studentAnswer || "(blank)"}\nCorrect answer: ${data.correctAnswer}\n\nStudy material:\n${buildContextBlock(chunks)}`,
        },
      ],
      temperature: 0.4,
      maxOutputTokens: 900,
    });

    const parsed = parseJsonBlock<Omit<MistakeReport, "sources">>(text);
    return {
      whyWrong: parsed?.whyWrong ?? text.slice(0, 600),
      conceptToReview: parsed?.conceptToReview ?? "Review the related topic in your notes.",
      recommendedPractice: parsed?.recommendedPractice ?? "Attempt 5 similar questions.",
      sources: [
        ...new Set(chunks.map((c) => `${c.source_label}${c.page_number ? ` · p.${c.page_number}` : ""}`)),
      ],
    };
  });

// ---------------------------------------------------------------------------
// Study plan generator
// ---------------------------------------------------------------------------
const planInput = z.object({
  subjectId: z.string().uuid().nullable().optional(),
  days: z.number().int().min(1).max(30),
  minutesPerDay: z.number().int().min(15).max(600),
  startDate: z.string(),
});

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data, context }): Promise<{ created: number }> => {
    const { supabase, userId } = context;

    let topicQuery = supabase
      .from("topics")
      .select("id, title, priority, status, mastery, subject_id")
      .order("mastery");
    if (data.subjectId) topicQuery = topicQuery.eq("subject_id", data.subjectId);
    const { data: topics, error } = await topicQuery;
    if (error) throw new Error(error.message);

    const pending = (topics ?? []).filter((t) => t.status !== "completed");
    if (pending.length === 0) return { created: 0 };

    const provider = getAIProvider();
    const { text } = await provider.complete({
      messages: [
        {
          role: "system",
          content:
            "You are a study planner. Distribute topics across the available days, prioritising low mastery and high-priority topics. " +
            `Return ONLY JSON: [{"day":number (1-based),"topic_id":string,"title":string,"minutes":number,"description":string}]`,
        },
        {
          role: "user",
          content: `Days: ${data.days}. Minutes available per day: ${data.minutesPerDay}.\nTopics:\n${pending
            .map((t) => `${t.id} | ${t.title} | priority ${t.priority} | mastery ${t.mastery}%`)
            .join("\n")}`,
        },
      ],
      temperature: 0.4,
      maxOutputTokens: 2000,
    });

    type PlanItem = { day: number; topic_id: string; title: string; minutes: number; description: string };
    const items = parseJsonBlock<PlanItem[]>(text) ?? [];
    const start = new Date(`${data.startDate}T00:00:00`);

    const rows = items.slice(0, data.days * 6).map((item) => {
      const date = new Date(start);
      date.setDate(start.getDate() + Math.max(0, (Number(item.day) || 1) - 1));
      const topic = pending.find((t) => t.id === item.topic_id);
      return {
        user_id: userId,
        subject_id: topic?.subject_id ?? data.subjectId ?? null,
        title: item.title || topic?.title || "Study session",
        description: item.description ?? null,
        task_date: date.toISOString().slice(0, 10),
        estimated_minutes: Math.min(240, Math.max(15, Number(item.minutes) || 45)),
        source: "ai",
      };
    });

    if (rows.length === 0) return { created: 0 };
    const { error: insertError } = await supabase.from("study_tasks").insert(rows as never);
    if (insertError) throw new Error(insertError.message);
    return { created: rows.length };
  });
