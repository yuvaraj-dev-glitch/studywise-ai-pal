import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarDays, Check, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddStudyTask,
  useDeleteStudyTask,
  useStudyTasks,
  useSubjects,
  useUpdateStudyTask,
} from "@/hooks/use-data";
import { generateStudyPlan } from "@/lib/study.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner · ExamSense" },
      {
        name: "description",
        content: "Generate an AI study plan across your remaining topics and track daily sessions.",
      },
      { property: "og:title", content: "Study Planner · ExamSense" },
      { property: "og:description", content: "Daily study schedule built around your weakest topics." },
    ],
  }),
  component: PlannerPage,
});

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function PlannerPage() {
  const { data: subjects } = useSubjects();
  const { data: tasks, refetch } = useStudyTasks();
  const addTask = useAddStudyTask();
  const updateTask = useUpdateStudyTask();
  const deleteTask = useDeleteStudyTask();
  const plan = useServerFn(generateStudyPlan);

  const [subjectId, setSubjectId] = useState("all");
  const [days, setDays] = useState("7");
  const [minutes, setMinutes] = useState("120");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState({ title: "", task_date: todayStr(), estimated_minutes: "45" });

  const grouped = (tasks ?? []).reduce<Record<string, typeof tasks>>((acc, t) => {
    (acc[t.task_date] ||= [])!.push(t);
    return acc;
  }, {});

  async function generate() {
    setLoading(true);
    try {
      const res = await plan({
        data: {
          subjectId: subjectId === "all" ? null : subjectId,
          days: Number(days),
          minutesPerDay: Number(minutes),
          startDate: todayStr(),
        },
      });
      await refetch();
      toast.success(res.created ? `${res.created} sessions scheduled` : "Nothing left to schedule");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build a plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Study Planner"
        description="An adaptive schedule that prioritises low-mastery, high-priority topics."
      />

      <Card className="rounded-2xl">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-4">
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
            <Label htmlFor="days">Days</Label>
            <Input id="days" type="number" min={1} max={30} value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mins">Minutes / day</Label>
            <Input
              id="mins"
              type="number"
              min={15}
              max={600}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 rounded-2xl">
        <CardContent className="p-4">
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!manual.title.trim()) return;
              await addTask.mutateAsync({
                title: manual.title.trim(),
                task_date: manual.task_date,
                estimated_minutes: Number(manual.estimated_minutes),
              });
              setManual({ ...manual, title: "" });
              toast.success("Session added");
            }}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="title">Add your own session</Label>
              <Input
                id="title"
                value={manual.title}
                onChange={(e) => setManual({ ...manual, title: e.target.value })}
                placeholder="Revise Unit 3"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={manual.task_date}
                onChange={(e) => setManual({ ...manual, task_date: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Input
                type="number"
                min={15}
                value={manual.estimated_minutes}
                onChange={(e) => setManual({ ...manual, estimated_minutes: e.target.value })}
              />
              <Button type="submit" variant="outline">
                <Plus className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No sessions scheduled yet.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([date, list]) => (
              <Card key={date} className="rounded-2xl">
                <CardHeader className="flex-row items-center gap-2 space-y-0">
                  <CalendarDays className="size-4 text-primary" />
                  <CardTitle className="font-display text-base">
                    {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(list ?? []).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.estimated_minutes} min</p>
                      </div>
                      <Badge variant={t.status === "completed" ? "default" : "outline"}>{t.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Mark complete"
                        onClick={() =>
                          updateTask.mutate({
                            id: t.id,
                            status: t.status === "completed" ? "pending" : "completed",
                          })
                        }
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete session"
                        onClick={() => deleteTask.mutate(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </Page>
  );
}
