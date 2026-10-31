import { cache } from "react";
import { sql, hasDb } from "@/lib/db";
import { order, type Node } from "./books";

export const getBook = cache(async (slug: string) => {
  if (!hasDb()) return null;
  try {
    const b = (await sql`select * from books where slug = ${slug} and status = 'published'`)[0] as any; if (!b) return null;
    const nodes = (await sql`select id, book_id, parent_id, kind, position, title, slug, status from book_nodes where book_id = ${b.id} and status = 'published' order by position`) as Node[];
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
export function hrefOf(bookSlug: string, nodes: Node[], n: Node) { const by = Object.fromEntries(nodes.map((x) => [x.id, x])); const segs: string[] = []; let c: Node | undefined = n; while (c) { segs.unshift(c.slug); c = c.parent_id ? by[c.parent_id] : undefined; } return `/books/${bookSlug}/${segs.join("/")}`; }
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
  return flat.map((n) => ({ id: n.id, title: n.title, href: hrefOf(slug, nodes, n), num: num[n.id], depth: depth(n), part: n.kind === "part", parent: n.parent_id }));
}
