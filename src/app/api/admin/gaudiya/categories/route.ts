import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/content/text";
import { revalidatePath } from "next/cache";

/** The Gauḍīya library's categories and subcategories. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select c.id, c.slug, c.name, c.description, c.parent_id, c.position, (select count(*)::int from books b where b.subject = c.slug) as n from gaudiya_categories c order by c.parent_id nulls first, c.position, c.name`);
}
/** { name, description?, parent_id? } */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim().slice(0, 120); if (!name) return fail("Give the category a name.");
  const parent = b.parent_id || null; const ps = parent ? ((await sql`select slug from gaudiya_categories where id = ${parent}`)[0] as any)?.slug : null;
  let slug = slugify(ps ? `${ps}-${name}` : name), k = 1; const base = slug; while ((await sql`select 1 from gaudiya_categories where slug = ${slug}`).length) slug = `${base}-${++k}`;
  const pos = Number((await sql`select coalesce(max(position), 0) + 1 as p from gaudiya_categories where parent_id is not distinct from ${parent}`)[0].p);
  const r = await sql`insert into gaudiya_categories (slug, name, description, parent_id, position) values (${slug}, ${name}, ${String(b.description || "").trim() || null}, ${parent}, ${pos}) returning id, slug`;
  revalidatePath("/gaudiya", "layout"); return json(r[0]);
}
/** { id, name?, description?, position? } — the web address (slug) stays, so books keep their category. */
export async function PATCH(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json().catch(() => ({}));
  const c = (await sql`select * from gaudiya_categories where id = ${b.id || null}`)[0] as any; if (!c) return fail("Not found", 404);
  await sql`update gaudiya_categories set name = ${b.name !== undefined ? String(b.name).trim() || c.name : c.name}, description = ${b.description !== undefined ? String(b.description).trim() || null : c.description}, position = ${b.position !== undefined ? Number(b.position) || 0 : c.position} where id = ${c.id}`;
  revalidatePath("/gaudiya", "layout"); return json({ ok: true });
}
/** ?id= — its subcategories go too; books in it become "not yet in a category". */
export async function DELETE(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const id = new URL(req.url).searchParams.get("id");
  const gone = (await sql`select slug from gaudiya_categories where id = ${id} or parent_id = ${id}`).map((r: any) => r.slug as string);
  await sql`update books set subject = null where subject = any(${gone}::text[])`; await sql`delete from gaudiya_categories where id = ${id}`;
  revalidatePath("/gaudiya", "layout"); return json({ ok: true });
}
