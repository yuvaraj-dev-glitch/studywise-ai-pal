import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Clock, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubjects } from "@/hooks/use-data";
import { generateQuestions, type GeneratedQuestion } from "@/lib/study.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/test")({
  head: () => ({
    meta: [
      { title: "Mock Test · ExamSense" },
      {
        name: "description",
        content: "Take a timed mock test generated from your own syllabus and review a scored report.",
      },
      { property: "og:title", content: "Mock Test · ExamSense" },
      { property: "og:description", content: "Timed practice tests built from your study material." },
    ],
  }),
  component: TestPage,
});

type Phase = "setup" | "running" | "result";

function TestPage() {
  const { data: subjects } = useSubjects();
  const generate = useServerFn(generateQuestions);

  const [phase, setPhase] = useState<Phase>("setup");
  const [subjectId, setSubjectId] = useState("all");
  const [count, setCount] = useState("10");
  const [minutes, setMinutes] = useState("15");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setPhase("result");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  async function start() {
    setLoading(true);
    try {
      const res = await generate({
        data: {
          subjectId: subjectId === "all" ? null : subjectId,
          count: Number(count),
          difficulty: "medium",
          questionType: "mcq",
          persist: false,
        },
      });
      if (!res.questions.length) {
        toast.error("Could not build a test — upload more material first");
        return;
      }
      setQuestions(res.questions);
      setAnswers({});
      setSecondsLeft(Number(minutes) * 60);
      setPhase("running");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the test");
    } finally {
      setLoading(false);
    }
  }

  const correct = questions.filter((q, i) => answers[i] === q.correct_answer).length;
  const attempted = Object.keys(answers).length;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  if (phase === "setup") {
    return (
      <Page>
        <PageHeader title="Mock Test" description="Simulate exam conditions with a timed test." />
        <Card className="rounded-2xl">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
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
              <Label>Questions</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "15", "20"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["10", "15", "30", "60"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Button onClick={start} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                Start test
              </Button>
            </div>
          </CardContent>
        </Card>
      </Page>
    );
  }

  if (phase === "running") {
    return (
      <Page>
        <PageHeader
          title="Mock Test"
          description={`${attempted}/${questions.length} answered`}
          action={
            <Badge variant="secondary" className="gap-1 text-sm">
              <Clock className="size-4" />
              {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </Badge>
          }
        />
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={i} className="rounded-2xl">
              <CardContent className="space-y-3 p-4">
                <p className="font-medium">
                  {i + 1}. {q.question_text}
                </p>
                {q.options?.length ? (
                  <div className="grid gap-2">
                    {q.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [i]: o }))}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                          answers[i] === o ? "border-primary bg-primary/10" : "hover:bg-muted",
                        )}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                    placeholder="Your answer"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <Button className="mt-4" onClick={() => setPhase("result")}>
          Submit test
        </Button>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Test report" description="Review every question and the model answer." />
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-base">
            Score {correct}/{questions.length} · {pct}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      <div className="mt-4 space-y-3">
        {questions.map((q, i) => {
          const ok = answers[i] === q.correct_answer;
          return (
            <Card key={i} className="rounded-2xl">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {i + 1}. {q.question_text}
                  </p>
                  <Badge variant={ok ? "default" : "destructive"}>{ok ? "Correct" : "Wrong"}</Badge>
                </div>
                <p className="text-muted-foreground">Your answer: {answers[i] ?? "—"}</p>
                <p>Correct answer: {q.correct_answer}</p>
                {q.explanation ? <p className="text-muted-foreground">{q.explanation}</p> : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button className="mt-4" variant="outline" onClick={() => setPhase("setup")}>
        New test
      </Button>
    </Page>
  );
}
