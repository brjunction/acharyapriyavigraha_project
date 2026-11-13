/* Upload a book's original file (Word, EPUB, …) to keep as a backup, in parts of 3 MB (browser side). */
export async function keepSource(bookId: string, file: File | Blob, name: string, onProgress?: (done: number) => void): Promise<string> {
  const PART = 3_000_000; const total = Math.max(1, Math.ceil(file.size / PART)); let sid = "";
  for (let i = 0; i < total; i++) {
    const fd = new FormData(); fd.append("file", file.slice(i * PART, (i + 1) * PART)); fd.append("index", String(i)); fd.append("total", String(total));
    fd.append("name", name); fd.append("mime", (file as File).type || "application/octet-stream"); fd.append("size", String(file.size)); if (sid) fd.append("sid", sid);
    const r = await fetch(`/api/admin/books/${bookId}/source`, { method: "POST", body: fd }); const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "The original file could not be kept."); sid = j.sid; onProgress?.((i + 1) / total);
  }
  return sid;
}
