import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download, Library, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects } from "@/hooks/use-data";
import { formatBytes, useDeleteMaterial, usePapers, useUploadPaper } from "@/hooks/use-materials";
import { getFileUrl, processDocument } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/papers")({
  head: () => ({
    meta: [
      { title: "Previous Year Papers · ExamSense" },
      {
        name: "description",
        content: "Upload and organise previous year question papers by university, year and semester.",
      },
      { property: "og:title", content: "Previous Year Papers · ExamSense" },
      { property: "og:description", content: "Your archive of past exam papers, ready for AI analysis." },
    ],
  }),
  component: PapersPage,
});

const EMPTY = {
  university: "",
  exam_name: "",
  academic_year: "",
  semester: "",
  paper_type: "end_sem",
};

function PapersPage() {
  const { data: subjects } = useSubjects();
  const { data: papers, isLoading, refetch } = usePapers();
  const upload = useUploadPaper();
  const remove = useDeleteMaterial("paper");
  const process = useServerFn(processDocument);
  const signUrl = useServerFn(getFileUrl);

  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState("none");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Choose a paper file");
    try {
      const id = await upload.mutateAsync({
        file,
        subject_id: subjectId === "none" ? null : subjectId,
        ...form,
      });
      setFile(null);
      setForm(EMPTY);
      setBusy(id);
      await process({ data: { kind: "paper", id } });
      await refetch();
      toast.success("Paper uploaded and analysed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function download(id: string) {
    const { url } = await signUrl({ data: { kind: "paper", id } });
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("File not available");
  }

  return (
    <Page>
      <PageHeader
        title="Previous Year Papers"
        description="Archive past papers with full metadata so the AI can spot recurring question patterns."
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={submit}>
            <div className="sm:col-span-2">
              <Label htmlFor="paper">Paper file</Label>
              <Input
                id="paper"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {(subjects ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={form.university}
                onChange={(e) => setForm({ ...form, university: e.target.value })}
                placeholder="Anna University"
              />
            </div>
            <div>
              <Label htmlFor="exam">Exam name</Label>
              <Input
                id="exam"
                value={form.exam_name}
                onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                placeholder="End Semester"
              />
            </div>
            <div>
              <Label htmlFor="year">Academic year</Label>
              <Input
                id="year"
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="2024-25"
              />
            </div>
            <div>
              <Label htmlFor="sem">Semester</Label>
              <Input
                id="sem"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                placeholder="5"
              />
            </div>
            <div>
              <Label>Paper type</Label>
              <Select
                value={form.paper_type}
                onValueChange={(v) => setForm({ ...form, paper_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end_sem">End semester</SelectItem>
                  <SelectItem value="mid_sem">Mid semester</SelectItem>
                  <SelectItem value="model">Model paper</SelectItem>
                  <SelectItem value="unit_test">Unit test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={upload.isPending || !!busy}>
                {upload.isPending || busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload paper
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : (papers ?? []).length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No papers yet.
            </CardContent>
          </Card>
        ) : (
          (papers ?? []).map((p) => (
            <Card key={p.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Library className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.filename ?? "Question paper"}</p>
                  <p className="text-xs text-muted-foreground">
                    {[p.university, p.exam_name, p.academic_year, p.semester && `Sem ${p.semester}`]
                      .filter(Boolean)
                      .join(" · ") || "No metadata"}{" "}
                    · {formatBytes(p.size_bytes)}
                  </p>
                </div>
                <Badge variant="outline">{p.status}</Badge>
                {p.status !== "processed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === p.id}
                    onClick={async () => {
                      setBusy(p.id);
                      try {
                        await process({ data: { kind: "paper", id: p.id } });
                        await refetch();
                        toast.success("Analysed");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed");
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    {busy === p.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Analyse
                  </Button>
                ) : null}
                <Button variant="ghost" size="icon" aria-label="Download" onClick={() => download(p.id)}>
                  <Download className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove.mutate(p.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Page>
  );
}
