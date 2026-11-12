import "server-only";
import { sql, hasDb } from "@/lib/db";
import { SITE } from "@/lib/cms/render";

export const PER_MAP = 40000;
type U = { url: string; lastModified?: string; priority: number };
/** Every readable page of the libraries: each book and each of its chapters, articles, magazine issues. */
export async function libraryUrls(): Promise<U[]> {
  if (!hasDb()) return [];
  try {
    const [books, nodes, arts, issues] = await Promise.all([
      sql`select id, slug, library, updated_at from books where status = 'published'`,
      sql`select n.id, n.book_id, n.parent_id, n.slug, n.updated_at from book_nodes n join books b on b.id = n.book_id where b.status = 'published' and n.status = 'published'`,
      sql`select slug, updated_at from articles where status = 'published'`,
      sql`select m.slug as mag, i.slug, i.updated_at from magazine_issues i join magazines m on m.id = i.magazine_id where i.status = 'published' and m.slug is not null`,
    ]);
    const bySlug = new Map(books.map((b: any) => [b.id, b.slug])); const byId = new Map(nodes.map((n: any) => [n.id, n]));
    const path = (n: any) => { const segs: string[] = []; let c = n, k = 0; while (c && k++ < 30) { segs.unshift(c.slug); c = c.parent_id ? byId.get(c.parent_id) : null; } return segs.map(encodeURIComponent).join("/"); };
    return [
      ...["/teachings/books", "/teachings/articles", "/teachings/magazines"].map((p) => ({ url: SITE + p, priority: 0.8 })),
      ...books.map((b: any) => ({ url: `${SITE}/books/${b.slug}`, lastModified: b.updated_at, priority: 0.8 })),
      ...nodes.filter((n: any) => bySlug.has(n.book_id)).map((n: any) => ({ url: `${SITE}/books/${bySlug.get(n.book_id)}/${path(n)}`, lastModified: n.updated_at, priority: 0.6 })),
      ...arts.map((a: any) => ({ url: `${SITE}/teachings/articles/${a.slug}`, lastModified: a.updated_at, priority: 0.6 })),
      ...issues.map((i: any) => ({ url: `${SITE}/teachings/magazines/${i.mag}/${i.slug}`, lastModified: i.updated_at, priority: 0.5 })),
    ];
  } catch { return []; }
}
export async function libraryMapCount() { if (!hasDb()) return 1; try { const r = (await sql`select (select count(*) from books where status = 'published') + (select count(*) from book_nodes) + (select count(*) from articles) + (select count(*) from magazine_issues) + 200 as n`)[0] as any; return Math.max(1, Math.ceil(Number(r.n) / PER_MAP)); } catch { return 1; } }
