// Document text extraction.
// Local extraction is limited to plain-text files. PDFs are sent directly to
// Cognee for indexing, so the upload pipeline still works for PDFs.

export async function extractTextFromFile(file: File): Promise<{ text: string; pageCount: number | null }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".json")) {
    return { text: new TextDecoder().decode(bytes), pageCount: 1 };
  }

  if (name.endsWith(".pdf")) {
    // Cognee parses PDFs during ingestion. We do not extract text locally here
    // to avoid a native canvas dependency in edge runtimes. For local Node.js
    // servers, you can install a parser and fill this in.
    return { text: "", pageCount: null };
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}
