import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useStudyTasks, useSubjects, useTopics, topicStats } from "@/hooks/use-data";
import { useDocuments } from "@/hooks/use-materials";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · ExamSense" },
      { name: "description", content: "Your study snapshot: subjects, syllabus progress, today's plan and weak topics." },
      { property: "og:title", content: "Dashboard · ExamSense" },
      { property: "og:description", content: "Track subjects, today's plan and syllabus progress." },
    ],
  }),
  component: Dashboard,
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: subjects, isLoading } = useSubjects();
  const { data: topics } = useTopics();
  const { data: tasks } = useStudyTasks(today());
  const { data: docs } = useDocuments();

  const stats = topicStats(topics);
  const pendingTasks = (tasks ?? []).filter((t) => t.status === "pending");
  const plannedMinutes = pendingTasks.reduce((sum, t) => sum + t.estimated_minutes, 0);

  const nextExam = (subjects ?? [])
    .filter((s) => s.exam_date)
    .sort((a, b) => (a.exam_date! < b.exam_date! ? -1 : 1))[0];
  const daysToExam = nextExam?.exam_date
    ? Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / 86_400_000)
    : null;

  const cards = [
    { label: "Subjects", value: subjects?.length ?? 0, icon: BookOpen },
    { label: "Syllabus done", value: `${stats.progress}%`, icon: TrendingUp },
    { label: "Today's plan", value: `${plannedMinutes} min`, icon: Clock },
    { label: "Weak topics", value: stats.weak, icon: Target },
  ];

  return (
    <Page>
      <PageHeader
        title={`Hi${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋`}
        description="Here's where your preparation stands right now."
        action={
          <Button asChild>
            <Link to="/tutor">
              <MessageSquare className="size-4" /> Ask the tutor
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <c.icon className="size-4" />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-base">Subjects</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/subjects">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </>
            ) : (subjects ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No subjects yet.{" "}
                <Link to="/subjects" className="font-medium text-primary">
                  Add your first subject
                </Link>
                .
              </div>
            ) : (
              (subjects ?? []).slice(0, 5).map((s) => {
                const st = topicStats(topics, s.id);
                return (
                  <Link
                    key={s.id}
                    to="/subjects/$subjectId"
                    params={{ subjectId: s.id }}
                    className="block rounded-xl border p-4 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.code}</p>
                      </div>
                      <Badge variant="secondary">{st.progress}%</Badge>
                    </div>
                    <Progress value={st.progress} className="mt-3 h-1.5" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="font-display text-base">Today</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/planner">Planner</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing scheduled. Generate a plan in the planner.
                </p>
              ) : (
                pendingTasks.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 rounded-xl border p-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.estimated_minutes} min</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-display text-base">At a glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next exam</span>
                <span className="font-medium">
                  {nextExam ? `${nextExam.code} · ${daysToExam}d` : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Topics completed</span>
                <span className="font-medium">
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">{docs?.length ?? 0}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/notes">
                  <FileText className="size-4" /> Upload material
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
