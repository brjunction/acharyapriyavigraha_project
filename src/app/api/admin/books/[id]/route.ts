import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/content/text";
import { revalidatePath } from "next/cache";

const COLS = ["title", "subtitle", "author", "category", "cover_url", "icon", "description", "layout", "publisher", "year", "language", "position", "status"];
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params;
  const b = (await sql`select * from books where id = ${id}`)[0]; if (!b) return fail("Not found", 404);
  const nodes = await sql`select id, parent_id, kind, position, title, slug, status, (jsonb_array_length(blocks) > 0) as has_text from book_nodes where book_id = ${id} order by position`;
  return json({ book: b, nodes });
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const sets: string[] = []; const vals: any[] = [];
  for (const k of COLS) if (k in b) { vals.push(k === "position" ? Number(b[k]) || 0 : b[k] === "" ? null : b[k]); sets.push(`${k} = $${vals.length}`); }
  if (b.slug) { vals.push(slugify(b.slug)); sets.push(`slug = $${vals.length}`); }
  if ("translation_of" in b) {
    if (!b.translation_of) { sets.push("work = null"); }
    else { const o = (await sql`select id, slug, work from books where id = ${b.translation_of}`)[0] as any; if (o && o.id !== id) { const key = o.work || o.slug; await sql`update books set work = ${key} where id = ${o.id} and work is null`; vals.push(key); sets.push(`work = $${vals.length}`); } }
  }
  if ("settings" in b) { vals.push(JSON.stringify(b.settings || {})); sets.push(`settings = $${vals.length}::jsonb`); }
  if (!sets.length) return json({ ok: true }); vals.push(id);
  try { await sql.query(`update books set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals); } catch { return fail("Another book already uses that address."); }
  revalidatePath("/teachings/books"); revalidatePath("/books", "layout"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from books where id = ${id}`; revalidatePath("/teachings/books"); return json({ ok: true });
}
