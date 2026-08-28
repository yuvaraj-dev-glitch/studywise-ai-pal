import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubjects } from "@/hooks/use-data";
import { generateQuestions, type GeneratedQuestion } from "@/lib/study.functions";

export const Route = createFileRoute("/_authenticated/questions")({
  head: () => ({
    meta: [
      { title: "Question Generator · ExamSense" },
      {
        name: "description",
        content: "Generate MCQ, short and long answer questions from your own syllabus and notes.",
      },
      { property: "og:title", content: "Question Generator · ExamSense" },
      { property: "og:description", content: "Exam-style practice questions built from your material." },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { data: subjects } = useSubjects();
  const generate = useServerFn(generateQuestions);

  const [subjectId, setSubjectId] = useState("all");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionType, setQuestionType] = useState<"mcq" | "short" | "long" | "application">("mcq");
  const [items, setItems] = useState<GeneratedQuestion[]>([]);
  const [reveal, setReveal] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generate({
        data: {
          subjectId: subjectId === "all" ? null : subjectId,
          topic: topic.trim() || undefined,
          count: Number(count),
          difficulty,
          questionType,
          persist: true,
        },
      });
      setItems(res.questions);
      setReveal({});
      if (!res.questions.length) toast.error("No questions generated — try a different topic");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Question Generator"
        description="Turn your uploaded material into exam-style practice questions."
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <form className="grid gap-3 sm:grid-cols-5" onSubmit={run}>
            <div className="sm:col-span-2">
              <Label htmlFor="topic">Topic focus</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Normalization"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {(subjects ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={questionType} onValueChange={(v) => setQuestionType(v as typeof questionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="short">Short answer</SelectItem>
                  <SelectItem value="long">Long answer</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Count</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["3", "5", "10", "15"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end sm:col-span-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {items.map((q, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary">{i + 1}</Badge>
                <p className="font-medium">{q.question_text}</p>
              </div>
              {q.options?.length ? (
                <ul className="space-y-1 pl-9 text-sm">
                  {q.options.map((o) => (
                    <li key={o} className="rounded-lg border px-3 py-2">
                      {o}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="pl-9">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReveal((r) => ({ ...r, [i]: !r[i] }))}
                >
                  {reveal[i] ? "Hide answer" : "Show answer"}
                </Button>
                {reveal[i] ? (
                  <div className="mt-3 space-y-2 rounded-xl bg-muted p-3 text-sm">
                    <p>
                      <span className="font-medium">Answer: </span>
                      {q.correct_answer}
                    </p>
                    {q.explanation ? <p className="text-muted-foreground">{q.explanation}</p> : null}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Page>
  );
}
