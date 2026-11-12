/* The fetcher's paragraphs → the website's blocks (the same blocks the Studio editor writes), and Markdown → paragraphs (for pages read by AI). */
import type { Chapter, Para, Run } from "./types";
import { plain, tidyRuns } from "./types";

let seq = 0; const id = () => `f${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const inline = (runs: Run[]) => runs.filter((r) => r.t).map((r) => ({ type: "text", text: r.sup ? `[${r.t.trim()}]` : r.t, styles: { ...(r.b ? { bold: true } : {}), ...(r.i ? { italic: true } : {}), ...(r.u ? { underline: true } : {}) } }));
export function paraToBlock(p: Para): any {
  const al = p.align ? { textAlignment: p.align } : {};
  if (p.kind === "hr") return { id: id(), type: "divider", props: {}, content: [], children: [] };
  if (p.kind === "h") return { id: id(), type: "heading", props: { level: Math.min(3, Math.max(2, (p.level || 1) + 1)), ...al }, content: inline(p.runs.map((r) => ({ ...r, b: undefined }))), children: [] };
  if (p.kind === "quote") return { id: id(), type: "quote", props: {}, content: inline(p.runs), children: [] };
  if (p.kind === "verse") return { id: id(), type: "paragraph", props: { textAlignment: p.align || "center" }, content: inline(p.runs), children: [] };
  return { id: id(), type: "paragraph", props: al, content: inline(p.runs), children: [] };
}
export const chapterBlocks = (c: Chapter) => c.paras.filter((p) => p.kind === "hr" || plain(p.runs).trim()).map(paraToBlock);

const mdRuns = (s: string): Run[] => { const out: Run[] = []; const re = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g; let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) { if (m.index > last) out.push({ t: s.slice(last, m.index) }); const x = m[0]; const k = x.startsWith("***") ? 3 : x.startsWith("**") ? 2 : 1; out.push({ t: x.slice(k, -k), ...(k >= 2 ? { b: 1 as const } : {}), ...(k !== 2 ? { i: 1 as const } : {}) }); last = m.index + x.length; }
  if (last < s.length) out.push({ t: s.slice(last) }); return out; };
/** Markdown from the AI page reader → paragraphs. `> lines` are a verse, `#` headings, `---` a rule, a line ending in two spaces keeps its break. */
export function mdToParas(md: string, page?: number): Para[] {
  const out: Para[] = []; for (const raw of String(md || "").replace(/\r/g, "").replace(/^```(?:markdown)?\n?|```$/g, "").split(/\n\s*\n/)) { const c = raw.trim(); if (!c) continue;
    const h = /^(#{1,6})\s+(.*)$/.exec(c); if (h && !c.includes("\n")) { out.push({ kind: "h", level: Math.min(4, h[1].length), runs: tidyRuns(mdRuns(h[2])), page }); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(c)) { out.push({ kind: "hr", runs: [], page }); continue; }
    const ls = c.split("\n"); if (ls.every((l) => /^>\s?/.test(l))) { out.push({ kind: "verse", align: "center", runs: tidyRuns(mdRuns(ls.map((l) => l.replace(/^>\s?/, "").trim()).join("\n"))), page }); continue; }
    const centered = /^<center>([\s\S]*)<\/center>$/i.exec(c); if (centered) { out.push({ kind: "p", align: "center", runs: tidyRuns(mdRuns(centered[1].trim())), page }); continue; }
    out.push({ kind: "p", runs: tidyRuns(mdRuns(ls.map((l) => l.trim()).join(" "))), page }); }
  return out;
}
/** Paragraphs of consecutive pages → chapters at the headings of the top level found. A paragraph cut by the page's end is joined to its continuation. */
export function parasToChapters(paras: Para[]): Chapter[] {
  const j: Para[] = []; for (const p of paras) { const l = j[j.length - 1]; if (l && p.kind === "p" && l.kind === "p" && !l.align && !p.align && l.page !== p.page && !/[.!?:”"’)\]]$/.test(plain(l.runs).trim()) && /^[a-zāīūṛṣṇśṁḥ]/.test(plain(p.runs))) { const t = plain(l.runs); l.runs = tidyRuns([...l.runs.map((r, k) => (k === l.runs.length - 1 && /[a-z]-$/.test(t) ? { ...r, t: r.t.replace(/-$/, "") } : r)), { t: /[a-z]-$/.test(t) ? "" : " " }, ...p.runs]); } else j.push({ ...p }); }
  const hs = j.filter((p) => p.kind === "h"); const top = hs.length ? Math.min(...hs.map((h) => h.level || 9)) : 0; const many = hs.filter((h) => h.level === top).length >= 2; const cut = many ? top : top + 1;
  const out: Chapter[] = []; let cur: Chapter | null = null; const front: Para[] = [];
  for (const p of j) { if (p.kind === "h" && top && (p.level || 9) >= cut && (p.level || 9) <= cut + 1) { cur = { title: plain(p.runs).replace(/\n/g, " "), level: (p.level || cut) === cut ? 1 : 2, paras: [], page: p.page }; out.push(cur); continue; } (cur ? cur.paras : front).push(p); }
  if (front.length) out.unshift({ title: out.length ? "Opening" : "Text", level: 1, paras: front, page: front[0].page }); if (out.length && out[0].level > 1) out[0].level = 1; return out;
}
