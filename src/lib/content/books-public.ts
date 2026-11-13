import { cache } from "react";
import { sql, hasDb } from "@/lib/db";
import { order, type Node } from "./books";

export const getBook = cache(async (slug: string) => {
  if (!hasDb()) return null;
  try {
    const b = (await sql`select * from books where slug = ${slug} and status = 'published'`)[0] as any; if (!b) return null;
    const nodes = (await sql`select id, book_id, parent_id, kind, position, title, slug, status, heads, page_mode, jsonb_array_length(coalesce(blocks, '[]'::jsonb)) = 0 as empty from book_nodes where book_id = ${b.id} and status = 'published' order by position`) as Node[];
    // hide nodes whose parent is hidden
    const ok = new Set<string>(); const all = new Set(nodes.map((n) => n.id));
    const visible = nodes.filter((n) => !n.parent_id || all.has(n.parent_id)); visible.forEach((n) => ok.add(n.id));
    return { book: b, nodes: visible, flat: order(visible) };
  } catch { return null; }
});
export function findByPath(nodes: Node[], path: string[]) {
  let parent: string | null = null; let cur: Node | undefined;
  for (const seg of path) { cur = nodes.find((n) => n.parent_id === parent && n.slug === decodeURIComponent(seg)); if (!cur) return null; parent = cur.id; }
  return cur || null;
}
/* Pages and sections. A heading set to "together" shows its sub-sections on its own page (they stay in the contents and
   link to their place on that page); a sub-section set to "own" keeps its own page even then. A section with no text of
   its own (only sub-sections) is a label in the contents, not a page. */
export function hostOf(nodes: Node[], n: Node): Node { const by = Object.fromEntries(nodes.map((x) => [x.id, x])); const walk = (x: Node): Node => { const p = x.parent_id ? by[x.parent_id] : undefined; if (!p || x.page_mode === "own") return x; const hp = walk(p); return hp.id !== p.id || p.page_mode === "together" ? hp : x; }; return walk(n); }
export function isLabel(nodes: Node[], n: Node) { return !!n.empty && n.page_mode !== "together" && hostOf(nodes, n).id === n.id && nodes.some((x) => x.parent_id === n.id); }
/** The pages a reader turns through, in order (sections shown inside another page, and empty labels, are not pages). */
export function pagesOf(nodes: Node[], flat: Node[]) { return flat.filter((n) => hostOf(nodes, n).id === n.id && !isLabel(nodes, n)); }
/** Sections shown on this page, below its own text, in reading order. */
export function insideOf(nodes: Node[], flat: Node[], page: Node) { return flat.filter((n) => n.id !== page.id && hostOf(nodes, n).id === page.id); }
export function pathHref(bookSlug: string, nodes: Node[], n: Node) { const by = Object.fromEntries(nodes.map((x) => [x.id, x])); const segs: string[] = []; let c: Node | undefined = n; while (c) { segs.unshift(c.slug); c = c.parent_id ? by[c.parent_id] : undefined; } return `/books/${bookSlug}/${segs.join("/")}`; }
export function hrefOf(bookSlug: string, nodes: Node[], n: Node) { const h = hostOf(nodes, n); if (h.id !== n.id) return `${pathHref(bookSlug, nodes, h)}#s-${n.slug}`; if (isLabel(nodes, n)) { const flatAll = order(nodes); const k = flatAll.findIndex((x) => x.id === n.id); const first = pagesOf(nodes, flatAll.slice(k + 1))[0]; if (first) return hrefOf(bookSlug, nodes, first); } return pathHref(bookSlug, nodes, n); }
export function numbering(nodes: Node[]) { const m: Record<string, string> = {}; const kids = (p: string | null) => nodes.filter((n) => n.parent_id === p).sort((a, b) => a.position - b.position); const walk = (p: string | null, pre: string) => kids(p).forEach((n, i) => { m[n.id] = pre ? `${pre}.${i + 1}` : `${i + 1}`; walk(n.id, m[n.id]); }); walk(null, ""); return m; }

/** The same book in other languages (books that share one "work"). */
export const getTranslations = cache(async (book: { id: string; work?: string | null }) => {
  if (!book.work || !hasDb()) return [] as { id: string; slug: string; title: string; language: string; cover_url: string | null }[];
  try { return (await sql`select id, slug, title, language, cover_url from books where work = ${book.work} and status = 'published' order by language = 'en' desc, title`) as any[]; } catch { return []; }
});
export type TocItem = { id: string; title: string; href: string; num: string; depth: number; part: boolean; parent: string | null };
export function tocOf(slug: string, nodes: Node[], flat: Node[]): TocItem[] {
  const num = numbering(nodes); const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const depth = (n: Node) => { let d = 0, c = n; while (c.parent_id && by[c.parent_id]) { d++; c = by[c.parent_id]; } return d; };
  return flat.flatMap((n) => { const href = hrefOf(slug, nodes, n); const d = depth(n); const hs = Array.isArray((n as any).heads) ? ((n as any).heads as { id: string; text: string }[]) : [];
    return [{ id: n.id, title: n.title, href, num: num[n.id], depth: d, part: n.kind === "part" || isLabel(nodes, n), parent: n.parent_id }, ...hs.map((h) => ({ id: `${n.id}#${h.id}`, title: h.text, href: `${href.split("#")[0]}#${h.id}`, num: "", depth: d + 1, part: false, parent: n.id }))]; });
}
