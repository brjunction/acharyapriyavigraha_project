import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { COLLECTIONS } from "@/lib/archive/config";
import { cleanItem, itemSearch, itemSlug, isJsonb, sectionsOf } from "@/lib/archive/server";

type C = { params: Promise<{ coll: string }> };
/** Every item of the collection (light), and its sections. */
export async function GET(_: Request, { params }: C) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { coll } = await params; if (!COLLECTIONS[coll]) return fail("Unknown section", 404);
  const [items, sections] = await Promise.all([
    sql`select id, section, slug, title, subtitle, person, recipient, to_char(date, 'YYYY-MM-DD') as date, year, date_label, place, country, cover, coalesce(cover, images->0->>'url') as thumb, jsonb_array_length(images) as photos, summary, status_label, featured, position, status, updated_at from archive_items where collection = ${coll} order by position, coalesce(date, make_date(year, 1, 1)) desc nulls last, title`,
    sectionsOf(coll),
  ]);
  return json({ items, sections });
}
export async function POST(req: Request, { params }: C) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { coll } = await params; if (!COLLECTIONS[coll]) return fail("Unknown section", 404);
  const b = await req.json();
  if (Array.isArray(b.import)) { let added = 0; for (const x of b.import.slice(0, 1000)) { if (!String(x.title || "").trim()) continue; await insert(coll, x); added++; } revalidatePath(COLLECTIONS[coll].base, "layout"); return json({ added }); }
  if (!String(b.title || "").trim()) return fail("Please give a title.");
  const r = await insert(coll, b); revalidatePath(COLLECTIONS[coll].base, "layout"); return json(r);
}
async function insert(coll: string, b: any) {
  const o = cleanItem(b); const cols = Object.keys(o);
  return (await sql.query(`insert into archive_items (collection, slug, search, ${cols.join(", ")}) values ($1, $2, $3, ${cols.map((k, i) => `$${i + 4}${isJsonb(k) ? "::jsonb" : k === "related" ? "::uuid[]" : ""}`).join(", ")}) returning id, slug`,
    [coll, await itemSlug(coll, o), itemSearch(o), ...cols.map((k) => o[k])]))[0];
}
/** Many at once: { ids, set: { section?, status? } }. */
export async function PATCH(req: Request, { params }: C) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { coll } = await params; const b = await req.json(); const ids: string[] = b.ids || [];
  if ("section" in (b.set || {})) await sql`update archive_items set section = ${b.set.section || null}, updated_at = now() where collection = ${coll} and id = any(${ids})`;
  if ("status" in (b.set || {})) await sql`update archive_items set status = ${b.set.status === "draft" ? "draft" : "published"}, updated_at = now() where collection = ${coll} and id = any(${ids})`;
  if (Array.isArray(b.order)) for (const [i, id] of (b.order as string[]).entries()) await sql`update archive_items set position = ${i} where collection = ${coll} and id = ${id}`;
  revalidatePath(COLLECTIONS[coll]?.base || "/", "layout"); return json({ ok: true });
}
