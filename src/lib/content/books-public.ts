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
