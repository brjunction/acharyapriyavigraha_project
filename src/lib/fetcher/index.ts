/* One door for every kind of file. Runs in the browser: the file never leaves the computer until "Save". */
import type { Fetched } from "./types";
import type { PdfRead } from "./pdf";
import type { LayoutOptions } from "./layout";

export type Opened = { book: Fetched; pdf?: { read: PdfRead; doc: any } };
export const kindOf = (name: string) => (/\.pdf$/i.test(name) ? "pdf" : /\.epub$/i.test(name) ? "epub" : /\.docx$/i.test(name) ? "docx" : /\.(txt|md)$/i.test(name) ? "text" : /\.zip$/i.test(name) ? "zip" : /\.doc$/i.test(name) ? "doc" : "");
let pdfjsP: Promise<any> | null = null;
export const pdfjs = () => (pdfjsP ||= import("pdfjs-dist").then((m: any) => { m.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; return m; }));

export async function openFile(bytes: Uint8Array, name: string, opt: LayoutOptions = {}, onProgress?: (done: number, total: number) => void): Promise<Opened> {
  const kind = kindOf(name);
  if (kind === "epub") { const { readEpub } = await import("./epub"); return { book: readEpub(bytes, name) }; }
  if (kind === "docx") { const { readDocx } = await import("./docx"); return { book: readDocx(bytes, name) }; }
  if (kind === "text") { const { mdToParas, parasToChapters } = await import("./blocks"); const { fromFileName } = await import("./epub"); const { tidyText } = await import("./balaram"); const [t, a] = fromFileName(name);
    const chapters = parasToChapters(mdToParas(tidyText(new TextDecoder().decode(bytes)))); return { book: { title: t, author: /^unknown$/i.test(a) ? "" : a, language: "en", cover: null, chapters, notes: [{ key: "read", text: `Text file read: ${chapters.length} chapters.` }], source: { name, kind: "text" } } }; }
  if (kind === "pdf") { const lib = await pdfjs(); const { readPdf } = await import("./pdf"); const { layoutPdf } = await import("./layout");
    const doc = await lib.getDocument({ data: bytes.slice(), verbosity: 0 }).promise; const read = await readPdf(doc, onProgress); return { book: layoutPdf(read, { ...opt, fileName: name }), pdf: { read, doc } }; }
  if (kind === "doc") throw new Error("Old Word files (.doc) cannot be read. Open it in Word and save it as .docx, then give it again.");
  throw new Error("This kind of file cannot be read. Give a PDF, an EPUB or a Word (.docx) file.");
}
/** A page of the PDF as a picture (for the cover, and for reading scanned pages). */
export async function pagePicture(doc: any, n: number, width = 1500, quality = 0.82): Promise<string> {
  const page = await doc.getPage(n); const v0 = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: Math.min(3, width / v0.width) });
  const c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height); const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise; const url = c.toDataURL("image/jpeg", quality); c.width = c.height = 0; page.cleanup?.(); return url;
}
