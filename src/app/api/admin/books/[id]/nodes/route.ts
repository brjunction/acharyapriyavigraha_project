import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { nodeSlug } from "@/lib/content/books";
import { revalidatePath } from "next/cache";

/** Add a part or chapter. { parent_id, title, kind, after? } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const title = String(b.title || "").trim() || "Untitled chapter"; const parent = b.parent_id || null;
  const pos = Number((await sql`select coalesce(max(position), -1) + 1 as p from book_nodes where book_id = ${id} and parent_id is not distinct from ${parent}`)[0].p);
  const r = await sql`insert into book_nodes (book_id, parent_id, kind, position, title, slug) values (${id}, ${parent}, ${b.kind || "chapter"}, ${pos}, ${title}, ${await nodeSlug(id, parent, title)}) returning id`;
  revalidatePath("/books", "layout"); return json(r[0]);
}
/** Move: { id, parent_id, position } — positions of the siblings are renumbered. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const n = (await sql`select * from book_nodes where id = ${b.id} and book_id = ${id}`)[0]; if (!n) return fail("Not found", 404);
  const parent = b.parent_id || null;
  if (parent) { let c: any = (await sql`select id, parent_id from book_nodes where id = ${parent}`)[0]; while (c) { if (c.id === b.id) return fail("A chapter cannot go inside itself."); c = c.parent_id ? (await sql`select id, parent_id from book_nodes where id = ${c.parent_id}`)[0] : null; } }
  const sibs = (await sql`select id from book_nodes where book_id = ${id} and parent_id is not distinct from ${parent} and id <> ${b.id} order by position`).map((x) => x.id as string);
  sibs.splice(Math.max(0, Math.min(sibs.length, Number(b.position) || 0)), 0, b.id);
  const slug = parent === n.parent_id ? n.slug : await nodeSlug(id, parent, n.title, n.id);
  await sql`update book_nodes set parent_id = ${parent}, slug = ${slug} where id = ${b.id}`;
  for (const [i, sid] of sibs.entries()) await sql`update book_nodes set position = ${i} where id = ${sid}`;
  revalidatePath("/books", "layout"); return json({ ok: true });
}
