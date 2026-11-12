import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/content/text";
import { nodeSearch } from "@/lib/content/books";
import { revalidatePath } from "next/cache";
import { articleSearch, articleSlug } from "@/lib/content/articles";

export const maxDuration = 120;
const LIBS = ["main"];
/** Saving a fetched book, in steps so that even very large books go through:
    { op: "start", book: { title, author, category, language, cover_url, status, library, acharya, layout, source }, into? } → { id, slug }   (into = replace the chapters of an existing book)
    { op: "nodes", book_id, nodes: [{ key, parent, title, blocks }] } → { map: { key: id } }      (parent = an id from an earlier answer, or a key of this same batch)
    { op: "finish", book_id } */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json().catch(() => null); if (!b) return fail("Nothing received.");
  if (b.op === "start") {
    const k = b.book || {}; const title = String(k.title || "").trim().slice(0, 300); if (!title) return fail("Give the book a title.");
    const library = LIBS.includes(k.library) ? k.library : "main"; const status = k.status === "published" ? "published" : "draft"; const source = JSON.stringify({ ...(k.source || {}), by: g.user.id, at: new Date().toISOString() });
    if (b.into) {
      const cur = (await sql`select id, slug from books where id = ${b.into}`)[0] as any; if (!cur) return fail("That book was not found.", 404);
      await sql`delete from book_nodes where book_id = ${cur.id}`;
      await sql`update books set title = ${title}, author = ${k.author || null}, category = ${k.category || null}, publisher = coalesce(${k.publisher || null}, publisher), language = ${k.language || "en"}, cover_url = coalesce(${k.cover_url || null}, cover_url), source = ${source}::jsonb, updated_at = now() where id = ${cur.id}`;
      return json({ id: cur.id, slug: cur.slug });
    }
    let s = slugify(title), n = 1; const base = s; while ((await sql`select 1 from books where slug = ${s}`).length) s = `${base}-${++n}`;
    const pos = Number((await sql`select coalesce(max(position), -1) + 1 as p from books where library = ${library} and category is not distinct from ${k.category || null}`)[0].p);
    const r = await sql`insert into books (slug, kind, title, author, category, publisher, language, cover_url, status, layout, library, acharya, position, source) values (${s}, ${["book", "scripture", "songs"].includes(k.kind) ? k.kind : "book"}, ${title}, ${k.author || null}, ${k.category || null}, ${k.publisher || null}, ${k.language || "en"}, ${k.cover_url || null}, ${status}, ${k.layout || "classic"}, ${library}, ${k.acharya || null}, ${pos}, ${source}::jsonb) returning id, slug`;
    return json(r[0]);
  }
  if (b.op === "nodes") {
    const id = String(b.book_id || ""); if (!(await sql`select 1 from books where id = ${id}`).length) return fail("That book was not found.", 404);
    const nodes: any[] = Array.isArray(b.nodes) ? b.nodes.slice(0, 400) : []; const map: Record<string, string> = {};
    const used = new Map<string, Set<string>>(); for (const r of await sql`select parent_id, slug from book_nodes where book_id = ${id}`) { const k = String(r.parent_id || ""); if (!used.has(k)) used.set(k, new Set()); used.get(k)!.add(r.slug as string); }
    const next = new Map<string, number>(); for (const r of await sql`select parent_id, coalesce(max(position), -1) + 1 as p from book_nodes where book_id = ${id} group by parent_id`) next.set(String(r.parent_id || ""), Number(r.p));
    for (const n of nodes) {
      const parent: string | null = n.parent ? map[n.parent] || String(n.parent) : null; const pk = parent || ""; const title = String(n.title || "").trim().slice(0, 300) || "Untitled chapter"; const blocks = Array.isArray(n.blocks) ? n.blocks : [];
      const set = used.get(pk) || new Set<string>(); used.set(pk, set); let s = slugify(title); if (s === "untitled") s = String(set.size + 1); const base = s; let i = 1; while (set.has(s)) s = `${base}-${++i}`; set.add(s);
      const pos = next.get(pk) || 0; next.set(pk, pos + 1);
      const r = await sql`insert into book_nodes (book_id, parent_id, kind, position, title, slug, blocks, search) values (${id}, ${parent}, ${n.kind === "part" ? "part" : "chapter"}, ${pos}, ${title}, ${s}, ${JSON.stringify(blocks)}::jsonb, ${nodeSearch(title, blocks).slice(0, 900000)}) returning id`;
      map[String(n.key)] = r[0].id as string;
    }
    return json({ map });
  }
  /* A magazine issue: { op: "issue", magazine_id, issue: { number, title, date, cover, status }, articles: [{ title, author, blocks }] } — one issue, its articles in order. */
  if (b.op === "issue") {
    const m = (await sql`select id from magazines where id = ${b.magazine_id || null}`)[0] as any; if (!m) return fail("Choose the magazine.");
    const x = b.issue || {}; const label = String(x.number || x.title || "issue").trim(); let slug = slugify(label), k = 1; const base = slug;
    while ((await sql`select 1 from magazine_issues where magazine_id = ${m.id} and slug = ${slug}`).length) slug = `${base}-${++k}`;
    const day = /^\d{4}-\d{2}-\d{2}$/.test(String(x.date || "")) ? x.date : null; const status = x.status === "published" ? "published" : "draft";
    const pos = Number((await sql`select coalesce(max(position), 0) + 1 as n from magazine_issues where magazine_id = ${m.id}`)[0].n);
    const iss = (await sql`insert into magazine_issues (magazine_id, slug, number, title, date, year, cover, position, status) values (${m.id}, ${slug}, ${x.number || null}, ${x.title || null}, ${day}, ${day ? Number(day.slice(0, 4)) : x.year ? Number(x.year) || null : null}, ${x.cover || null}, ${pos}, ${status}) returning id, slug`)[0] as any;
    const arts: any[] = Array.isArray(b.articles) ? b.articles.slice(0, 200) : [];
    for (const [i, a] of arts.entries()) { const t = String(a.title || "").trim().slice(0, 300) || `Article ${i + 1}`; const body = Array.isArray(a.blocks) ? a.blocks : [];
      const row = { title: t, author: a.author || null, body, date: day, status }; await sql`insert into articles (slug, search, title, author, body, date, status, issue_id, issue_position, section) values (${await articleSlug(t)}, ${articleSearch(row)}, ${t}, ${a.author || null}, ${JSON.stringify(body)}::jsonb, ${day}, ${status}, ${iss.id}, ${i + 1}, ${a.section || null})`; }
    revalidatePath("/teachings/magazines", "layout"); revalidatePath("/teachings/articles", "layout"); return json({ id: iss.id, slug: iss.slug, articles: arts.length });
  }
  if (b.op === "finish") { revalidatePath("/books", "layout"); revalidatePath("/", "layout"); return json({ ok: true }); }
  return fail("Unknown step.");
}
