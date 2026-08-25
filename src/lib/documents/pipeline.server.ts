import { unzipSync, strFromU8 } from "fflate";

/**
 * Document processing pipeline primitives (pure, storage-agnostic).
 *
 *   extractDocumentText()  -> page-aware plain text
 *   chunkDocument()        -> RAG-ready chunks with page references
 *
 * `storeDocumentChunks()` lives in `src/lib/documents.functions.ts` because it
 * needs a database client.
 */

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  text: string;
  pageCount: number;
}

export interface DocumentChunk {
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  tokenEstimate: number;
}

const CHUNK_TARGET = 1200;
const CHUNK_OVERLAP = 150;

function normalize(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(bytes: Uint8Array): Promise<ExtractedPage[]> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [String(text)];
  return pages.map((t, i) => ({ pageNumber: i + 1, text: normalize(t) }));
}

function extractDocx(bytes: Uint8Array): ExtractedPage[] {
  const files = unzipSync(bytes);
  const doc = files["word/document.xml"];
  if (!doc) throw new Error("This DOCX file could not be read.");
  const xml = strFromU8(doc);
  const text = xml
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<w:tab[^>]*\/>/g, " ")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  return [{ pageNumber: 1, text: normalize(text) }];
}

/** Step 2 of the pipeline: turn raw file bytes into page-aware plain text. */
export async function extractDocumentText(
  bytes: Uint8Array,
  mimeType: string,
  filename: string,
): Promise<ExtractionResult> {
  const lower = filename.toLowerCase();
  let pages: ExtractedPage[];

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    pages = await extractPdf(bytes);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    pages = extractDocx(bytes);
  } else if (mimeType.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md")) {
    pages = [{ pageNumber: 1, text: normalize(strFromU8(bytes)) }];
  } else {
    throw new Error(`Unsupported file type: ${mimeType || filename}`);
  }

  pages = pages.filter((p) => p.text.length > 0);
  return {
    pages,
    text: pages.map((p) => p.text).join("\n\n"),
    pageCount: pages.length,
  };
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .flatMap((block) => (block.length <= CHUNK_TARGET * 2 ? [block] : block.split(/(?<=[.!?])\s+/)))
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Step 3 of the pipeline: split extracted text into overlapping, page-tagged chunks. */
export function chunkDocument(pages: ExtractedPage[]): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let index = 0;

  for (const page of pages) {
    const parts = splitParagraphs(page.text);
    let buffer = "";

    const flush = () => {
      const content = buffer.trim();
      if (content.length < 40) return;
      chunks.push({
        chunkIndex: index++,
        content,
        pageNumber: page.pageNumber,
        tokenEstimate: Math.ceil(content.length / 4),
      });
      buffer = content.slice(Math.max(0, content.length - CHUNK_OVERLAP));
    };

    for (const part of parts) {
      if ((buffer + "\n\n" + part).length > CHUNK_TARGET && buffer.trim().length > 0) flush();
      buffer = buffer ? `${buffer}\n\n${part}` : part;
      while (buffer.length > CHUNK_TARGET * 2) {
        const slice = buffer.slice(0, CHUNK_TARGET);
        chunks.push({
          chunkIndex: index++,
          content: slice,
          pageNumber: page.pageNumber,
          tokenEstimate: Math.ceil(slice.length / 4),
        });
        buffer = buffer.slice(CHUNK_TARGET - CHUNK_OVERLAP);
      }
    }
    if (buffer.trim().length >= 40) {
      chunks.push({
        chunkIndex: index++,
        content: buffer.trim(),
        pageNumber: page.pageNumber,
        tokenEstimate: Math.ceil(buffer.trim().length / 4),
      });
    }
  }

  return chunks;
}
