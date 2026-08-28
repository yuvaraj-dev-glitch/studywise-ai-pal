import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, FileText, Loader2, Search, Sparkles, Trash2, Upload } from "lucide-react";
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
import {
  formatBytes,
  useDeleteMaterial,
  useDocuments,
  useUploadDocument,
} from "@/hooks/use-materials";
import { getFileUrl, processDocument } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes & Documents · ExamSense" },
      {
        name: "description",
        content: "Upload PDF, DOCX and TXT study material, process it for AI retrieval, search and manage your library.",
      },
      { property: "og:title", content: "Notes & Documents · ExamSense" },
      { property: "og:description", content: "Your personal study material library." },
    ],
  }),
  component: NotesPage,
});

const STATUS_TONE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  processed: "default",
  processing: "secondary",
  uploaded: "outline",
  failed: "destructive",
};

function NotesPage() {
  const { data: subjects } = useSubjects();
  const { data: docs, isLoading, refetch } = useDocuments();
  const upload = useUploadDocument();
  const remove = useDeleteMaterial("document");
  const process = useServerFn(processDocument);
  const signUrl = useServerFn(getFileUrl);

  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState<string>("none");
  const [docType, setDocType] = useState("note");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs ?? [];
    return (docs ?? []).filter(
      (d) =>
        d.filename.toLowerCase().includes(q) ||
        (d.extracted_text ?? "").toLowerCase().includes(q),
    );
  }, [docs, query]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    try {
      const id = await upload.mutateAsync({
        file,
        subject_id: subjectId === "none" ? null : subjectId,
        doc_type: docType,
      });
      setFile(null);
      toast.success("Uploaded — processing for AI search");
      setBusy(id);
      await process({ data: { kind: "document", id } });
      await refetch();
      toast.success("Document processed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function download(id: string) {
    const { url } = await signUrl({ data: { kind: "document", id } });
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("File not available");
  }

  return (
    <Page>
      <PageHeader
        title="Notes & Documents"
        description="Upload your notes, textbooks and handouts. Processed files power the AI tutor with citations."
      />

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleUpload}>
            <div className="sm:col-span-2">
              <Label htmlFor="file">File (PDF, DOCX, TXT)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.txt,.docx,application/pdf,text/plain"
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
              <Label>Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="pdf">Textbook / PDF</SelectItem>
                  <SelectItem value="material">Other material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={upload.isPending || !!busy}>
                {upload.isPending || busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload & process
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search filenames and document text"
          className="pl-9"
        />
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </>
        ) : filtered.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No documents match. Upload your first note above.
            </CardContent>
          </Card>
        ) : (
          filtered.map((d) => (
            <Card key={d.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(d.size_bytes)} · {d.chunk_count} chunks
                    {d.page_count ? ` · ${d.page_count} pages` : ""} ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={STATUS_TONE[d.status] ?? "outline"}>{d.status}</Badge>
                {d.status !== "processed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === d.id}
                    onClick={async () => {
                      setBusy(d.id);
                      try {
                        await process({ data: { kind: "document", id: d.id } });
                        await refetch();
                        toast.success("Processed");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Processing failed");
                      } finally {
                        setBusy(null);
                      }
                    }}
                  >
                    {busy === d.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Process
                  </Button>
                ) : null}
                <Button variant="ghost" size="icon" aria-label="Download" onClick={() => download(d.id)}>
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => remove.mutate(d.id)}
                >
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
