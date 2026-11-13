/* Magazine issues from PDF files (browser side): upload the PDF in parts, make the cover from page 1, and read the
   issue number, date and title from the file name and the first pages. */
import { pdfjs } from "@/lib/fetcher";
import { pdfContents, type TocItem } from "@/lib/content/pdf-contents";

export async function uploadPdf(file: File, onProgress?: (d: number) => void): Promise<string> {
  const PART = 3_000_000; const total = Math.max(1, Math.ceil(file.size / PART)); let sid = ""; let url = "";
  for (let i = 0; i < total; i++) {
    const fd = new FormData(); fd.append("file", file.slice(i * PART, (i + 1) * PART)); fd.append("index", String(i)); fd.append("total", String(total));
    fd.append("name", file.name); fd.append("mime", "application/pdf"); fd.append("size", String(file.size)); if (sid) fd.append("sid", sid);
    const r = await fetch("/api/admin/files", { method: "POST", body: fd }); const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "The PDF could not be uploaded."); sid = j.sid; url = j.url; onProgress?.((i + 1) / total);
  }
  return url;
}

/** Page 1 of the PDF as a cover picture (WebP, 900 px wide), saved to Pictures & files. Returns its address. */
export async function coverFromPdf(src: File | string | Uint8Array): Promise<string> {
  const lib = await pdfjs(); const data = typeof src === "string" ? { url: src } : src instanceof Uint8Array ? { data: src.slice() } : { data: new Uint8Array(await src.arrayBuffer()) };
  const doc = await lib.getDocument({ ...data, isEvalSupported: false }).promise;
  try {
    const pg = await doc.getPage(1); const v0 = pg.getViewport({ scale: 1 }); const v = pg.getViewport({ scale: 900 / v0.width });
    const c = document.createElement("canvas"); c.width = Math.round(v.width); c.height = Math.round(v.height);
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: v }).promise;
    const blob: Blob = await new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("No cover"))), "image/webp", 0.86));
    const fd = new FormData(); fd.append("file", new File([blob], "cover.webp", { type: "image/webp" }));
    const r = await fetch("/api/admin/media", { method: "POST", body: fd }); const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "The cover could not be saved."); return j.url;
  } finally { doc.destroy(); }
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/** A PDF kept elsewhere (a link), fetched once through the site for the Studio to read; nothing is stored. */
export async function fetchLinked(url: string): Promise<Uint8Array> {
  const r = await fetch(`/api/admin/fetch-pdf?url=${encodeURIComponent(url)}`); if (!r.ok) throw new Error((await r.text().catch(() => "")) || "The PDF could not be reached at that link.");
  const b = new Uint8Array(await r.arrayBuffer()); if (String.fromCharCode(...b.slice(0, 5)) !== "%PDF-") throw new Error("That link does not give a PDF file (is it shared publicly?)."); return b;
}
export const linkName = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() || "issue.pdf"); } catch { return "issue.pdf"; } };

/** Number, date, title and contents of an issue, from its file name and the PDF itself. */
export async function guessIssue(src: File | { bytes: Uint8Array; name: string }): Promise<{ number: string; title: string; date: string; text: string; toc: TocItem[] }> {
  const name = src instanceof File ? src.name : src.name;
  const base = name.replace(/\.pdf$/i, "").replace(/^[0-9a-f]{8}-/i, "");
  let number = (/(?:bindu|issue|no\.?|#)\s*[-_ ]?(\d{1,5})/i.exec(base) || /(\d{2,5})/.exec(base))?.[1] || "";
  let title = base.replace(/^.*?(?:bindu|issue)\s*[-_ ]?\d+\s*[-_ ]*/i, "").replace(/[_]+/g, " ").replace(/\s*-\s*/g, " — ").replace(/\s+/g, " ").trim();
  if (!title || title === base) title = base.replace(/[_-]+/g, " ").trim();
  let date = ""; let text = ""; let toc: TocItem[] = [];
  try {
    const lib = await pdfjs(); const bytes = src instanceof File ? new Uint8Array(await src.arrayBuffer()) : src.bytes.slice();
    const doc = await lib.getDocument({ data: bytes, isEvalSupported: false }).promise;
    for (let p = 1; p <= Math.min(2, doc.numPages); p++) { const tc = await (await doc.getPage(p)).getTextContent(); text += tc.items.map((x: any) => x.str).join(" ") + "\n"; }
    try { toc = await pdfContents(doc); } catch {}
    doc.destroy();
    const n = /Issue\s*(?:No\.?|Number)?\s*(\d{1,5})/i.exec(text); if (n && !number) number = n[1];
    const d = new RegExp(`(\\d{1,2})\\s+(${MONTHS.join("|")})\\s+(\\d{4})`, "i").exec(text) || new RegExp(`(${MONTHS.join("|")})\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i").exec(text);
    if (d) { const [day, mon, yr] = /^\d/.test(d[1]) ? [d[1], d[2], d[3]] : [d[2], d[1], d[3]]; date = `${yr}-${String(MONTHS.indexOf(mon.toLowerCase()) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`; }
  } catch {}
  return { number: number ? `Issue ${number}` : "", title, date, text, toc };
}
