import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubjects } from "@/hooks/use-data";
import { explainMistake, type MistakeReport } from "@/lib/study.functions";

export const Route = createFileRoute("/_authenticated/mistakes")({
  head: () => ({
    meta: [
      { title: "Mistake Explainer · ExamSense" },
      {
        name: "description",
        content: "Paste a question you got wrong and get a diagnosis, the concept to review and practice advice.",
      },
      { property: "og:title", content: "Mistake Explainer · ExamSense" },
      { property: "og:description", content: "Understand exactly why an answer was wrong." },
    ],
  }),
  component: MistakesPage,
});

function MistakesPage() {
  const { data: subjects } = useSubjects();
  const explain = useServerFn(explainMistake);
  const [subjectId, setSubjectId] = useState("all");
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [report, setReport] = useState<MistakeReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      setReport(
        await explain({
          data: {
            question,
            studentAnswer,
            correctAnswer,
            subjectId: subjectId === "all" ? null : subjectId,
          },
        }),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not analyse the mistake");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Mistake Explainer"
        description="Turn every wrong answer into a targeted revision plan."
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <form className="space-y-3" onSubmit={run}>
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="w-full sm:w-64">
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
              <Label htmlFor="q">Question</Label>
              <Textarea id="q" value={question} onChange={(e) => setQuestion(e.target.value)} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="a">Your answer</Label>
                <Textarea id="a" value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="c">Correct answer</Label>
                <Textarea id="c" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
              Explain my mistake
            </Button>
          </form>
        </CardContent>
      </Card>

      {report ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            { title: "Why it was wrong", body: report.whyWrong },
            { title: "Concept to review", body: report.conceptToReview },
            { title: "Recommended practice", body: report.recommendedPractice },
          ].map((c) => (
            <Card key={c.title} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{c.body}</CardContent>
            </Card>
          ))}
          {report.sources.length ? (
            <div className="flex flex-wrap gap-1.5 lg:col-span-3">
              {report.sources.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Page>
  );
}
