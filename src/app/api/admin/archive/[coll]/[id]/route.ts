import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { COLLECTIONS } from "@/lib/archive/config";
import { cleanItem, itemSearch, itemSlug, isJsonb } from "@/lib/archive/server";

type C = { params: Promise<{ coll: string; id: string }> };
export async function GET(_: Request, { params }: C) { const g = await guard("viewer"); if ("res" in g) return g.res; const { coll, id } = await params; const r = await sql`select *, to_char(date, 'YYYY-MM-DD') as date from archive_items where collection = ${coll} and id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: C) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { coll, id } = await params; const b = await req.json();
  const cur = (await sql`select * from archive_items where collection = ${coll} and id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const o = cleanItem(b); if ("title" in o && !String(o.title || "").trim()) return fail("The title cannot be empty.");
  const all = { ...cur, ...o, body: "body" in o ? JSON.parse(o.body) : cur.body };
  const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(o)) { vals.push(v); sets.push(`${k} = $${vals.length}${isJsonb(k) ? "::jsonb" : k === "related" ? "::uuid[]" : ""}`); }
  if (o.title && o.title !== cur.title) { vals.push(await itemSlug(coll, all, id)); sets.push(`slug = $${vals.length}`); }
  vals.push(itemSearch(all)); sets.push(`search = $${vals.length}`); vals.push(id);
  const r = await sql.query(`update archive_items set ${sets.join(", ")}, updated_at = now() where id = $${vals.length} returning slug`, vals);
  revalidatePath(COLLECTIONS[coll]?.base || "/", "layout"); return json({ ok: true, slug: r[0]?.slug });
}
export async function DELETE(_: Request, { params }: C) { const g = await guard("editor"); if ("res" in g) return g.res; const { coll, id } = await params; await sql`delete from archive_items where collection = ${coll} and id = ${id}`; revalidatePath(COLLECTIONS[coll]?.base || "/", "layout"); return json({ ok: true }); }
