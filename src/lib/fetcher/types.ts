/* The book fetcher: one shape for a book read from any file (PDF, EPUB, Word, scanned pages).
   Everything here is plain data and runs in the browser, in the Studio — nothing is uploaded until "Save". */
export type Run = { t: string; b?: 1; i?: 1; u?: 1; sup?: 1 };
export type Para = {
  kind: "p" | "h" | "verse" | "quote" | "hr";
  level?: number;                         // headings: 1 (largest) … 4
  align?: "center" | "right" | "justify"; // left is the default
  runs: Run[];                            // verse lines are separated by "\n" inside the runs
  page?: number;                          // where it came from (PDF page), for the editor to check
};
export type Chapter = { title: string; level: number; paras: Para[]; page?: number };
export type Note = { key: string; text: string; count?: number };
export type Fetched = {
  title: string; author: string; language: string;
  cover?: { bytes: Uint8Array; type: string } | null;
  chapters: Chapter[];
  notes: Note[];                          // what the fetcher did and what it is unsure about
  source: { name: string; kind: "pdf" | "pdf-scan" | "epub" | "docx" | "text"; pages?: number };
};
export const plain = (runs: Run[]) => runs.map((r) => r.t).join("");
/** Joins neighbouring runs of the same style and trims the ends. */
export function tidyRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of runs) { if (!r.t) continue; const l = out[out.length - 1]; if (l && !l.b === !r.b && !l.i === !r.i && !l.u === !r.u && !l.sup === !r.sup) l.t += r.t; else out.push({ ...r }); }
  // spaces between styled words belong outside the style
  for (const r of out) if (!r.t.trim()) { delete r.b; delete r.i; delete r.u; }
  const m: Run[] = []; for (const r of out) { const l = m[m.length - 1]; if (l && !l.b === !r.b && !l.i === !r.i && !l.u === !r.u && !l.sup === !r.sup) l.t += r.t; else m.push(r); }
  if (m.length) { m[0].t = m[0].t.replace(/^[ \t\n]+/, ""); m[m.length - 1].t = m[m.length - 1].t.replace(/[ \t\n]+$/, ""); }
  return m.filter((r) => r.t).map((r) => ({ ...r, t: r.t.replace(/[ \t]{2,}/g, " ").replace(/ ?\n ?/g, "\n") }));
}
