import { createFileRoute, Link } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubjects, useTopics } from "@/hooks/use-data";

export const Route = createFileRoute("/_authenticated/weak-topics")({
  head: () => ({
    meta: [
      { title: "Weak Topics · ExamSense" },
      {
        name: "description",
        content: "The topics dragging your scores down, ranked by mastery with recommended revision time.",
      },
      { property: "og:title", content: "Weak Topics · ExamSense" },
      { property: "og:description", content: "Focus your revision where it matters most." },
    ],
  }),
  component: WeakTopicsPage,
});

function WeakTopicsPage() {
  const { data: topics } = useTopics();
  const { data: subjects } = useSubjects();

  const weak = (topics ?? [])
    .filter((t) => t.status !== "completed" && t.mastery < 60)
    .sort((a, b) => a.mastery - b.mastery);

  const subjectName = (id: string) => subjects?.find((s) => s.id === id)?.name ?? "Subject";

  return (
    <Page>
      <PageHeader
        title="Weak Topics"
        description="Ranked by mastery — clear these first for the biggest score gain."
        action={
          <Button asChild variant="outline">
            <Link to="/planner">Plan revision</Link>
          </Button>
        }
      />

      {weak.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nothing flagged as weak right now. Keep going.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {weak.map((t) => {
            const recommended = Math.max(20, Math.round((60 - t.mastery) * 1.5));
            const priority = t.mastery < 25 ? "critical" : t.mastery < 45 ? "high" : "medium";
            return (
              <Card key={t.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Target className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{subjectName(t.subject_id)}</p>
                    </div>
                    <Badge variant={priority === "critical" ? "destructive" : "secondary"}>
                      {priority}
                    </Badge>
                    <Badge variant="outline">{recommended} min</Badge>
                  </div>
                  <Progress value={t.mastery} className="mt-3 h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
