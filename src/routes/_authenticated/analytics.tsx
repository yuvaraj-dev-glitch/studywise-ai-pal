import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { topicStats, useStudyTasks, useSubjects, useTopics } from "@/hooks/use-data";
import { useDocuments } from "@/hooks/use-materials";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Progress Analytics · ExamSense" },
      {
        name: "description",
        content: "See syllabus coverage, study minutes and mastery trends across every subject.",
      },
      { property: "og:title", content: "Progress Analytics · ExamSense" },
      { property: "og:description", content: "Measure how your preparation is actually going." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: subjects } = useSubjects();
  const { data: topics } = useTopics();
  const { data: tasks } = useStudyTasks();
  const { data: docs } = useDocuments();

  const overall = topicStats(topics);
  const completedTasks = (tasks ?? []).filter((t) => t.status === "completed");
  const studiedMinutes = completedTasks.reduce((s, t) => s + t.estimated_minutes, 0);
  const avgMastery = topics?.length
    ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
    : 0;

  const cards = [
    { label: "Overall syllabus", value: `${overall.progress}%`, icon: BookOpen },
    { label: "Average mastery", value: `${avgMastery}%`, icon: Target },
    { label: "Sessions completed", value: completedTasks.length, icon: CheckCircle2 },
    { label: "Minutes studied", value: studiedMinutes, icon: Clock },
  ];

  return (
    <Page>
      <PageHeader title="Progress Analytics" description="A clear read on where your preparation stands." />

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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-base">Subject-wise coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(subjects ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects yet.</p>
            ) : (
              (subjects ?? []).map((s) => {
                const st = topicStats(topics, s.id);
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">
                        {st.completed}/{st.total}
                      </span>
                    </div>
                    <Progress value={st.progress} className="mt-2 h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-base">Study library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Documents uploaded" value={docs?.length ?? 0} />
            <Row
              label="Processed for AI"
              value={(docs ?? []).filter((d) => d.status === "processed").length}
            />
            <Row
              label="Knowledge chunks"
              value={(docs ?? []).reduce((s, d) => s + (d.chunk_count ?? 0), 0)}
            />
            <Row label="Topics needing review" value={overall.review} />
            <Row label="Weak topics" value={overall.weak} />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
