import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAIProvider } from "@/lib/ai/registry.server";
import { chunkDocument, extractDocumentText } from "@/lib/documents/pipeline.server";

const BUCKET = "study-materials";

const processInput = z.object({
  kind: z.enum(["document", "paper"]),
  id: z.string().uuid(),
});

export interface ProcessResult {
  status: "processed" | "failed";
  chunkCount: number;
  pageCount: number;
  message?: string;
}

/**
 * Step 1-5 of the pipeline for an already-uploaded file:
 * download -> extractDocumentText -> chunkDocument -> embed -> storeDocumentChunks.
 */
export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => processInput.parse(data))
  .handler(async ({ data, context }): Promise<ProcessResult> => {
    const { supabase, userId } = context;
    const table = data.kind === "document" ? "documents" : "question_papers";

    const { data: row, error: rowError } = await supabase
      .from(table)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (rowError) throw new Error(rowError.message);
    if (!row) throw new Error("File not found.");

    const record = row as unknown as {
      storage_path: string | null;
      filename: string | null;
      mime_type: string | null;
      subject_id: string | null;
      unit_id?: string | null;
      topic_id?: string | null;
      exam_name?: string | null;
      academic_year?: string | null;
    };

    const fail = async (message: string): Promise<ProcessResult> => {
      await supabase
        .from(table)
        .update({ status: "failed", error_message: message })
        .eq("id", data.id);
      return { status: "failed", chunkCount: 0, pageCount: 0, message };
    };

    if (!record.storage_path) return fail("No stored file for this record.");

    await supabase
      .from(table)
      .update({ status: "processing", error_message: null })
      .eq("id", data.id);

    try {
      const { data: file, error: dlError } = await supabase.storage
        .from(BUCKET)
        .download(record.storage_path);
      if (dlError || !file) throw new Error(dlError?.message ?? "Could not download the file.");

      const bytes = new Uint8Array(await file.arrayBuffer());
      const extraction = await extractDocumentText(
        bytes,
        record.mime_type ?? file.type ?? "",
        record.filename ?? "file",
      );
      if (extraction.text.trim().length < 40) {
        return fail("No readable text found (the file may be a scanned image).");
      }

      const chunks = chunkDocument(extraction.pages);
      if (chunks.length === 0) return fail("Document produced no usable text chunks.");

      // Replace any previous chunks for this file.
      await supabase
        .from("document_chunks")
        .delete()
        .eq(data.kind === "document" ? "document_id" : "paper_id", data.id);

      const provider = getAIProvider();
      const { vectors } = await provider.embed(chunks.map((c) => c.content));

      const sourceLabel =
        data.kind === "document"
          ? (record.filename ?? "Document")
          : `${record.exam_name ?? "Question paper"} ${record.academic_year ?? ""}`.trim();

      const rows = chunks.map((chunk, i) => ({
        user_id: userId,
        subject_id: record.subject_id,
        document_id: data.kind === "document" ? data.id : null,
        paper_id: data.kind === "paper" ? data.id : null,
        unit_id: data.kind === "document" ? (record.unit_id ?? null) : null,
        topic_id: data.kind === "document" ? (record.topic_id ?? null) : null,
        source_label: sourceLabel,
        source_kind: data.kind,
        chunk_index: chunk.chunkIndex,
        page_number: chunk.pageNumber,
        content: chunk.content,
        token_estimate: chunk.tokenEstimate,
        embedding: JSON.stringify(vectors[i] ?? []),
      }));

      for (let i = 0; i < rows.length; i += 100) {
        const { error: insertError } = await supabase
          .from("document_chunks")
          .insert(rows.slice(i, i + 100) as never);
        if (insertError) throw new Error(insertError.message);
      }

      const { error: updateError } = await supabase
        .from(table)
        .update({
          status: data.kind === "document" ? "processed" : "analyzed",
          page_count: extraction.pageCount,
          chunk_count: chunks.length,
          extracted_text: extraction.text.slice(0, 400000),
          processed_at: data.kind === "document" ? new Date().toISOString() : undefined,
          error_message: null,
        } as never)
        .eq("id", data.id);
      if (updateError) throw new Error(updateError.message);

      return { status: "processed", chunkCount: chunks.length, pageCount: extraction.pageCount };
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Processing failed.");
    }
  });

const previewInput = z.object({
  kind: z.enum(["document", "paper"]),
  id: z.string().uuid(),
});

/** Signed URL for in-app preview / download. */
export const getFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => previewInput.parse(data))
  .handler(async ({ data, context }): Promise<{ url: string | null }> => {
    const table = data.kind === "document" ? "documents" : "question_papers";
    const { data: row } = await context.supabase
      .from(table)
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    const path = (row as { storage_path: string | null } | null)?.storage_path;
    if (!path) return { url: null };
    const { data: signed } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);
    return { url: signed?.signedUrl ?? null };
  });
