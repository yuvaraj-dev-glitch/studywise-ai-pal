import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAIProvider } from "@/lib/ai/registry.server";
import { buildContextBlock, tutorSystemPrompt } from "@/lib/ai/prompts";

const askInput = z.object({
  question: z.string().min(2).max(4000),
  mode: z.enum(["simple", "exam", "deep"]),
  sessionId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
});

export interface TutorAnswer {
  sessionId: string;
  answer: string;
  sources: string[];
  confidence: number;
}

/**
 * Retrieval-augmented tutor. Embeds the question, retrieves the closest chunks
 * from the student's own uploads, then answers with citations and persists the
 * exchange to chat history.
 */
export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => askInput.parse(data))
  .handler(async ({ data, context }): Promise<TutorAnswer> => {
    const { supabase, userId } = context;

    let sessionId = data.sessionId ?? null;
    if (!sessionId) {
      const { data: created, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          mode: data.mode,
          title: data.question.slice(0, 60),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      sessionId = created.id;
    }

    await supabase.from("chat_messages").insert({
      user_id: userId,
      session_id: sessionId,
      role: "user",
      content: data.question,
    });

    const provider = getAIProvider();
    const { vectors } = await provider.embed([data.question]);

    const { data: matches } = await supabase.rpc("match_document_chunks", {
      query_embedding: JSON.stringify(vectors[0] ?? []) as unknown as string,
      match_count: 8,
      ...(data.subjectId ? { p_subject_id: data.subjectId } : {}),
    });

    const chunks = (matches ?? []) as {
      source_label: string;
      page_number: number | null;
      content: string;
      similarity: number;
    }[];

    const relevant = chunks.filter((c) => c.similarity > 0.15);
    const contextBlock = buildContextBlock(relevant);

    const { text } = await provider.complete({
      messages: [
        { role: "system", content: tutorSystemPrompt(data.mode) },
        {
          role: "user",
          content: `Study material context:\n\n${contextBlock}\n\nStudent question: ${data.question}`,
        },
      ],
      temperature: data.mode === "exam" ? 0.3 : 0.6,
       maxOutputTokens: 1400,
    });

    const sources = [
      ...new Set(
        relevant.map(
          (c) => `${c.source_label}${c.page_number ? ` · p.${c.page_number}` : ""}`,
        ),
      ),
    ];
    const topSimilarity = relevant[0]?.similarity ?? 0;
    const confidence = relevant.length
      ? Math.min(98, Math.round(55 + topSimilarity * 45))
      : 45;

    await supabase.from("chat_messages").insert({
      user_id: userId,
      session_id: sessionId,
      role: "assistant",
      content: text,
      sources,
      confidence,
    });

    await supabase
      .from("chat_sessions")
      .update({ mode: data.mode, updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return { sessionId, answer: text, sources, confidence };
  });
