import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/content/text";
import { nodeSearch } from "@/lib/content/books";
import { revalidatePath } from "next/cache";

export const maxDuration = 120;
const LIBS = ["main", "gaudiya"];
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
      await sql`update books set title = ${title}, author = ${k.author || null}, category = ${k.category || null}, language = ${k.language || "en"}, cover_url = coalesce(${k.cover_url || null}, cover_url), source = ${source}::jsonb, updated_at = now() where id = ${cur.id}`;
      return json({ id: cur.id, slug: cur.slug });
    }
    let s = slugify(title), n = 1; const base = s; while ((await sql`select 1 from books where slug = ${s}`).length) s = `${base}-${++n}`;
    const pos = Number((await sql`select coalesce(max(position), -1) + 1 as p from books where library = ${library} and category is not distinct from ${k.category || null}`)[0].p);
    const r = await sql`insert into books (slug, title, author, category, language, cover_url, status, layout, library, acharya, position, source) values (${s}, ${title}, ${k.author || null}, ${k.category || null}, ${k.language || "en"}, ${k.cover_url || null}, ${status}, ${k.layout || "classic"}, ${library}, ${k.acharya || null}, ${pos}, ${source}::jsonb) returning id, slug`;
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
  if (b.op === "finish") { revalidatePath("/books", "layout"); revalidatePath("/", "layout"); return json({ ok: true }); }
  return fail("Unknown step.");
}
