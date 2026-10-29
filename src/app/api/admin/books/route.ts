import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/content/text";

export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select b.id, b.slug, b.title, b.subtitle, b.author, b.category, b.cover_url, b.icon, b.status, b.layout, b.language, b.position, (select count(*)::int from book_nodes n where n.book_id = b.id) as chapters from books b order by b.category nulls last, b.position, b.title`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); const title = String(b.title || "").trim(); if (!title) return fail("Give the book a title.");
  let s = slugify(title), n = 1; const base = s; while ((await sql`select 1 from books where slug = ${s}`).length) s = `${base}-${++n}`;
  const r = await sql`insert into books (slug, title, author, category, layout) values (${s}, ${title}, ${b.author || null}, ${b.category || null}, ${b.layout || "classic"}) returning id`; return json(r[0]);
}
