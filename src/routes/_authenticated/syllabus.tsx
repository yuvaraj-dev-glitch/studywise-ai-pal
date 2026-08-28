import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  markTopicStatus,
  topicStats,
  useAddTopic,
  useAddUnit,
  useDeleteTopic,
  useDeleteUnit,
  useSubjects,
  useTopics,
  useUnits,
  useUpdateTopic,
} from "@/hooks/use-data";
import type { Priority, TopicStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/syllabus")({
  head: () => ({
    meta: [
      { title: "Syllabus Manager · ExamSense" },
      {
        name: "description",
        content: "Build your syllabus unit by unit, set topic priorities and track what is completed.",
      },
      { property: "og:title", content: "Syllabus Manager · ExamSense" },
      { property: "og:description", content: "Organise units and topics and track syllabus coverage." },
    ],
  }),
  component: SyllabusPage,
});

const STATUSES: TopicStatus[] = ["not_started", "in_progress", "review", "completed"];

function SyllabusPage() {
  const { data: subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState<string>("");
  const active = subjectId || subjects?.[0]?.id || "";

  const { data: units } = useUnits(active || undefined);
  const { data: topics } = useTopics(active || undefined);
  const addUnit = useAddUnit();
  const addTopic = useAddTopic();
  const deleteUnit = useDeleteUnit();
  const deleteTopic = useDeleteTopic();
  const updateTopic = useUpdateTopic();

  const [unitTitle, setUnitTitle] = useState("");
  const [topicDrafts, setTopicDrafts] = useState<Record<string, string>>({});
  const stats = topicStats(topics, active || undefined);

  if (!subjects?.length) {
    return (
      <Page>
        <PageHeader title="Syllabus" description="Add a subject first to build its syllabus." />
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No subjects yet — create one from My Subjects.
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Syllabus Manager"
        description="Break each subject into units and topics, then track coverage as you study."
        action={
          <Select value={active} onValueChange={setSubjectId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Card className="rounded-2xl">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-40 flex-1">
            <p className="text-xs text-muted-foreground">Syllabus completion</p>
            <Progress value={stats.progress} className="mt-2 h-2" />
          </div>
          <div className="text-sm font-medium">
            {stats.completed}/{stats.total} topics · {stats.progress}%
          </div>
        </CardContent>
      </Card>

      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!unitTitle.trim()) return;
          await addUnit.mutateAsync({ subject_id: active, title: unitTitle.trim() });
          setUnitTitle("");
          toast.success("Unit added");
        }}
      >
        <Input
          value={unitTitle}
          onChange={(e) => setUnitTitle(e.target.value)}
          placeholder="New unit title (e.g. Unit 1 — Foundations)"
        />
        <Button type="submit">
          <Plus className="size-4" /> Unit
        </Button>
      </form>

      <div className="mt-4 space-y-4">
        {(units ?? []).map((unit) => {
          const unitTopics = (topics ?? []).filter((t) => t.unit_id === unit.id);
          return (
            <Card key={unit.id} className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="font-display text-base">{unit.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete unit"
                  onClick={() => deleteUnit.mutate(unit.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {unitTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics yet.</p>
                ) : (
                  unitTopics.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border p-3"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.title}</span>
                      <Badge variant="secondary">{t.priority}</Badge>
                      <Badge variant="outline">{t.mastery}%</Badge>
                      <Select
                        value={t.status}
                        onValueChange={(v) =>
                          updateTopic.mutate(markTopicStatus(t, v as TopicStatus))
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete topic"
                        onClick={() => deleteTopic.mutate(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))
                )}

                <form
                  className="flex gap-2 pt-1"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const title = (topicDrafts[unit.id] ?? "").trim();
                    if (!title) return;
                    await addTopic.mutateAsync({
                      subject_id: active,
                      unit_id: unit.id,
                      title,
                      priority: "medium" as Priority,
                    });
                    setTopicDrafts((d) => ({ ...d, [unit.id]: "" }));
                  }}
                >
                  <Input
                    value={topicDrafts[unit.id] ?? ""}
                    onChange={(e) =>
                      setTopicDrafts((d) => ({ ...d, [unit.id]: e.target.value }))
                    }
                    placeholder="Add topic"
                  />
                  <Button type="submit" variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
