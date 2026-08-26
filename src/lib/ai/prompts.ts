import type { TutorMode } from "@/lib/types";

export const TUTOR_MODES: { id: TutorMode; label: string; hint: string }[] = [
  { id: "simple", label: "Simple", hint: "Plain-language explanation with an analogy" },
  { id: "exam", label: "Exam answer", hint: "Structured, marks-oriented model answer" },
  { id: "deep", label: "Deep dive", hint: "First-principles depth and connections" },
];

export function tutorSystemPrompt(mode: TutorMode): string {
  const base =
    "You are ExamSense, a college exam tutor. Answer ONLY from the student's study material provided as context when it is relevant. " +
    "Cite the sources you used inline like [1], [2] matching the numbered context blocks. " +
    "If the context does not cover the question, say so briefly and then answer from general knowledge, clearly marked as 'Beyond your uploaded material'. " +
    "Use markdown-free plain text with short paragraphs, numbered steps and clear headings.";

  const byMode: Record<TutorMode, string> = {
    simple:
      "Style: Simple explanation. Use everyday language, one concrete analogy, and finish with a 3-bullet recap. Keep it under 250 words.",
    exam:
      "Style: Exam answer. Produce a structured answer suitable for an 8-10 mark university question: Definition, Principle/Working, Key equations with symbols defined, Diagram description, Application and limitation. End with a one-line examiner tip.",
    deep:
      "Style: Deep explanation. Derive from first principles, state assumptions and where they break down, compare with neighbouring topics, and end with 2 probing self-test questions.",
  };

  return `${base}\n${byMode[mode]}`;
}

export function buildContextBlock(
  chunks: { source_label: string; page_number: number | null; content: string }[],
): string {
  if (chunks.length === 0) return "No study material matched this question.";
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.source_label}${c.page_number ? ` (page ${c.page_number})` : ""}\n${c.content}`,
    )
    .join("\n\n");
}

/** Extract the first JSON value from a model response. */
export function parseJsonBlock<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "```").split("```").join("\n");
  const start = cleaned.search(/[[{]/);
  if (start === -1) return null;
  const opener = cleaned[start];
  const closer = opener === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(closer);
  if (end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
