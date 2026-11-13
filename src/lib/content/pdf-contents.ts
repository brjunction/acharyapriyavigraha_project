/* An issue's contents, read from its PDF: the PDF's own bookmarks if it has them, else the headings — lines set larger
   than the text, or in the display type of the titles. Only titles and their pages; nothing else is taken from the text.
   Runs in the browser (Studio and the reader). */
import { pageLines, type Line } from "@/lib/fetcher/pdf";

export type TocItem = { title: string; page: number };
const txt = (l: Line) => l.pieces.map((p) => p.t).join("").replace(/\s+/g, " ").trim();
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/\p{M}+/gu, "").replace(/[^a-z0-9]+/g, "");
const fam = (f: string) => f.replace(/^[A-Z]{6}\+/, "").replace(/[-_,]?(bold|italic|black|semi|demi|heavy|medium|light|regular|oblique|sc\d*|caps|it\b|bd\b).*$/i, "").toLowerCase();
const strong = (f: string) => /bold|black|heavy|semi|demi|-sc|caps/i.test(f);

/** "D etermineD", "emotions evoKeD", "U nreliable blacK men !" (small-capital display type) → "Determined", "Emotions Evoked", "Unreliable Black Men!" */
export function tidyTitle(s: string) {
  let t = s.replace(/\s+/g, " ").replace(/^[•·\-–—\s]+/, "").replace(/\s+([!?.,:;’”])/g, "$1").trim();
  t = t.replace(/(^|\s)([A-ZĀĪŪṚŚṢṆ]) (?=[a-zāīūṛṣṇśḍṭ]{2,})/g, "$1$2");          // a dropped capital set apart
  const odd = t.split(" ").some((w) => /[a-zāīūṛṣṇś][A-ZĀĪŪṚŚṢṆ]/.test(w));          // capitals inside words: small-capital type
  if (odd || (t === t.toLowerCase() && /[a-z]{3}/.test(t))) {
    const small = new Set(["a", "an", "the", "of", "in", "on", "and", "to", "for", "from", "by", "is", "as", "at", "with", "or"]);
    t = t.toLowerCase().split(" ").map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
  }
  return t;
}

export async function pdfContents(doc: any, maxPages = 80): Promise<TocItem[]> {
  // 1 · bookmarks
  try { const o = await doc.getOutline(); if (o?.length) { const out: TocItem[] = []; const walk = async (xs: any[], d: number) => { for (const it of xs || []) { let page = 0; try { const dest = typeof it.dest === "string" ? await doc.getDestination(it.dest) : it.dest; if (dest) page = (await doc.getPageIndex(dest[0])) + 1; } catch {} if (page && it.title?.trim() && d < 2) out.push({ title: tidyTitle(it.title), page }); await walk(it.items, d + 1); } }; await walk(o, 0); if (out.length >= 2) return out; } } catch {}
  // 2 · headings
  const n = Math.min(doc.numPages, maxPages); const all: Line[] = [];
  for (let p = 1; p <= n; p++) { try { const pg = await doc.getPage(p); all.push(...(await pageLines(pg, p))); pg.cleanup?.(); } catch {} }
  if (!all.length) return [];
  const w = new Map<number, number>(), fw = new Map<string, number>();
  for (const l of all) for (const p of l.pieces) { const c = p.t.trim().length; if (!c) continue; w.set(Math.round(p.z * 2) / 2, (w.get(Math.round(p.z * 2) / 2) || 0) + c); fw.set(fam(p.font), (fw.get(fam(p.font)) || 0) + c); }
  const body = [...w.entries()].sort((a, b) => b[1] - a[1])[0][0]; const bodyFam = [...fw.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const seen = new Map<string, Set<number>>(); for (const l of all) { const k = norm(txt(l)).replace(/\d+/g, ""); if (!seen.has(k)) seen.set(k, new Set()); seen.get(k)!.add(l.page); }
  const isHead = (l: Line) => { const t = txt(l); if (l.page === 1 || t.length < 3 || t.length > 90 || !/\p{L}{2}/u.test(t) || /^[•·]/.test(t)) return false;
    if (/page\s*[—–-]+\s*\d|^issue\b|www\.|\.org\b|^\d+$/i.test(t) || (seen.get(norm(t).replace(/\d+/g, ""))?.size || 0) >= 3) return false;
    const chars = l.pieces.filter((p) => p.t.trim()); const big = l.size >= body * 1.3;
    const display = chars.filter((p) => fam(p.font) !== bodyFam && strong(p.font)).reduce((a, p) => a + p.t.trim().length, 0) >= t.replace(/\s/g, "").length * 0.7 && l.size >= body * 0.95;
    return big || display; };
  const out: TocItem[] = []; let last: Line | null = null;
  for (const l of all) { if (!isHead(l)) { last = null; continue; }
    if (last && last.page === l.page && last.col === l.col && l.top - last.top < Math.max(l.size, last.size) * 2.4 && out.length) { out[out.length - 1].title += " " + txt(l); last = l; continue; }
    out.push({ title: txt(l), page: l.page }); last = l; }
  const res: TocItem[] = []; const at = new Map<string, number>();
  for (const x of out) { x.title = tidyTitle(x.title); if (x.title.length < 3 || x.title.length > 110) continue; const k = norm(x.title); if (at.has(k)) { res[at.get(k)!] = x; continue; } at.set(k, res.length); res.push(x); }
  return res.sort((a, b) => a.page - b.page);
}
