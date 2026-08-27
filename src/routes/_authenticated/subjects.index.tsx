import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { topicStats, useAddSubject, useDeleteSubject, useSubjects, useTopics } from "@/hooks/use-data";

export const Route = createFileRoute("/_authenticated/subjects/")({
  head: () => ({
    meta: [
      { title: "My Subjects · ExamSense" },
      { name: "description", content: "Manage every subject you are preparing for, with syllabus progress and exam dates." },
      { property: "og:title", content: "My Subjects · ExamSense" },
      { property: "og:description", content: "All your subjects and syllabus progress in one place." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const { data: topics } = useTopics();
  const addSubject = useAddSubject();
  const deleteSubject = useDeleteSubject();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", exam_date: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addSubject.mutateAsync({
        name: form.name,
        code: form.code,
        description: form.description,
        exam_date: form.exam_date || null,
      });
      toast.success("Subject added");
      setForm({ name: "", code: "", description: "", exam_date: "" });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add subject");
    }
  }

  return (
    <Page>
      <PageHeader
        title="My Subjects"
        description="Every subject you're preparing for, with live syllabus progress."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">New subject</DialogTitle>
                <DialogDescription>Add a paper from your current semester.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Power Electronics"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="EE8552"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam">Exam date</Label>
                    <Input
                      id="exam"
                      type="date"
                      value={form.exam_date}
                      onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addSubject.isPending}>
                    {addSubject.isPending ? "Saving…" : "Save subject"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (subjects ?? []).length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-10 text-center">
            <p className="font-display text-lg font-semibold">No subjects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a subject to start building your syllabus and uploading materials.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(subjects ?? []).map((s) => {
            const st = topicStats(topics, s.id);
            return (
              <Card key={s.id} className="group rounded-2xl transition-shadow hover:shadow-lifted">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/subjects/$subjectId" params={{ subjectId: s.id }} className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code}</p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => {
                        if (confirm(`Delete ${s.name} and all its data?`)) {
                          deleteSubject.mutate(s.id, {
                            onSuccess: () => toast.success("Subject deleted"),
                          });
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  {s.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {st.completed}/{st.total} topics
                    </span>
                    {s.exam_date ? <Badge variant="secondary">Exam {s.exam_date}</Badge> : null}
                  </div>
                  <Progress value={st.progress} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
