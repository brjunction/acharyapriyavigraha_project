import { sql } from "@/lib/db";
import { fold, slugify } from "./text";
import { docText } from "@/components/cms/doc-text";

export type Node = { id: string; book_id: string; parent_id: string | null; kind: string; position: number; title: string; slug: string; status: string };
export { LAYOUTS } from "./book-layouts";
export async function nodeSlug(bookId: string, parentId: string | null, title: string, id?: string) {
  let s = slugify(title), n = 1;
  if (s === "untitled") s = String(Number((await sql`select count(*)::int c from book_nodes where book_id = ${bookId} and parent_id is not distinct from ${parentId} and id is distinct from ${id ?? null}`)[0]?.c || 0) + 1);
  const b = s;
  while ((await sql`select 1 from book_nodes where book_id = ${bookId} and parent_id is not distinct from ${parentId} and slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`;
  return s;
}
export const nodeSearch = (title: string, blocks: any[]) => fold(`${title} ${docText(blocks || [], 200000)}`);
/** Path of slugs from the book down to this node. */
export function pathOf(nodes: Node[], id: string): string[] { const by = Object.fromEntries(nodes.map((n) => [n.id, n])); const out: string[] = []; let c = by[id]; while (c) { out.unshift(c.slug); c = c.parent_id ? by[c.parent_id] : undefined as any; } return out; }
/** Depth-first reading order. */
export function order(nodes: Node[]): Node[] { const kids = (p: string | null) => nodes.filter((n) => n.parent_id === p).sort((a, b) => a.position - b.position); const out: Node[] = []; const walk = (p: string | null) => kids(p).forEach((n) => { out.push(n); walk(n.id); }); walk(null); return out; }
