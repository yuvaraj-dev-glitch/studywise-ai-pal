import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  CalendarDays,
  FileText,
  LineChart,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExamSense — AI Study Companion for College Exams" },
      {
        name: "description",
        content:
          "Upload your syllabus, notes and previous-year papers. ExamSense turns them into an AI tutor, mock tests, a study planner and progress analytics.",
      },
      { property: "og:title", content: "ExamSense — AI Study Companion for College Exams" },
      {
        property: "og:description",
        content: "Learn from your own notes with an AI tutor, generated questions, mock tests and a smart study planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: FileText, title: "Your own materials", body: "Upload PDFs, notes and DOCX. We extract, chunk and index them for retrieval." },
  { icon: MessageSquare, title: "AI tutor with citations", body: "Simple, exam-answer or deep-dive modes — every answer cites your material." },
  { icon: BookOpen, title: "Previous year papers", body: "Store papers by university, year and semester, and mine them for patterns." },
  { icon: Brain, title: "Mistake explainer", body: "Understand why an answer was wrong and exactly what to revise next." },
  { icon: CalendarDays, title: "Study planner", body: "Auto-build a day-by-day plan weighted by priority and weak mastery." },
  { icon: LineChart, title: "Progress analytics", body: "Track study minutes, accuracy and topic mastery over time." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">ExamSense</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Target className="size-3.5" /> Built for college semester exams
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Study from <span className="text-primary">your</span> notes, not someone else&apos;s.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              ExamSense reads your syllabus, notes and previous-year papers, then tutors you, generates
              questions, plans your week and shows exactly where you are weak.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth">Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="rounded-2xl shadow-sm transition-shadow hover:shadow-lifted">
                <CardContent className="p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
          ExamSense · Your personal exam preparation companion
        </div>
      </footer>
    </div>
  );
}
