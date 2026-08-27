import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "study-materials";

export interface DocumentRow {
  id: string;
  subject_id: string | null;
  unit_id: string | null;
  topic_id: string | null;
  filename: string;
  doc_type: string;
  status: string;
  page_count: number | null;
  size_bytes: number | null;
  chunk_count: number;
  mime_type: string | null;
  error_message: string | null;
  extracted_text: string | null;
  created_at: string;
}

export interface PaperRow {
  id: string;
  subject_id: string | null;
  university: string | null;
  exam_name: string | null;
  academic_year: string | null;
  semester: string | null;
  paper_type: string;
  filename: string | null;
  status: string;
  page_count: number;
  chunk_count: number;
  size_bytes: number | null;
  error_message: string | null;
  extracted_text: string | null;
  created_at: string;
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function useDocuments(subjectId?: string) {
  return useQuery({
    queryKey: ["documents", subjectId ?? "all"],
    queryFn: async (): Promise<DocumentRow[]> => {
      let q = supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as DocumentRow[];
    },
  });
}

export function usePapers(subjectId?: string) {
  return useQuery({
    queryKey: ["papers", subjectId ?? "all"],
    queryFn: async (): Promise<PaperRow[]> => {
      let q = supabase.from("question_papers").select("*").order("created_at", { ascending: false });
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as PaperRow[];
    },
  });
}

async function uploadToStorage(file: File) {
  const uid = await requireUserId();
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${uid}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return { uid, path };
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      subject_id: string | null;
      unit_id?: string | null;
      topic_id?: string | null;
      doc_type: string;
    }): Promise<string> => {
      const { uid, path } = await uploadToStorage(input.file);
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: uid,
          subject_id: input.subject_id,
          unit_id: input.unit_id ?? null,
          topic_id: input.topic_id ?? null,
          filename: input.file.name,
          doc_type: input.doc_type,
          mime_type: input.file.type || null,
          size_bytes: input.file.size,
          storage_path: path,
          status: "uploaded",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useUploadPaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      subject_id: string | null;
      university: string;
      exam_name: string;
      academic_year: string;
      semester: string;
      paper_type: string;
    }): Promise<string> => {
      const { uid, path } = await uploadToStorage(input.file);
      const { data, error } = await supabase
        .from("question_papers")
        .insert({
          user_id: uid,
          subject_id: input.subject_id,
          university: input.university,
          exam_name: input.exam_name,
          academic_year: input.academic_year,
          semester: input.semester,
          paper_type: input.paper_type,
          filename: input.file.name,
          mime_type: input.file.type || null,
          size_bytes: input.file.size,
          storage_path: path,
          status: "uploaded",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers"] }),
  });
}

export function useDeleteMaterial(kind: "document" | "paper") {
  const qc = useQueryClient();
  const table = kind === "document" ? "documents" : "question_papers";
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: row } = await supabase
        .from(table)
        .select("storage_path")
        .eq("id", id)
        .maybeSingle();
      const path = (row as { storage_path: string | null } | null)?.storage_path;
      await supabase.from("document_chunks").delete().eq(kind === "document" ? "document_id" : "paper_id", id);
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["papers"] });
    },
  });
}
