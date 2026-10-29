import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { cleanArticle, articleSearch, articleSlug } from "@/lib/content/articles";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params; const r = await sql`select * from articles where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const cur = (await sql`select * from articles where id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const a = cleanArticle(b); const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}${k === "body" ? "::jsonb" : ""}`); }
  if (b.slug && b.slug !== cur.slug) { vals.push(await articleSlug(String(b.slug), id)); sets.push(`slug = $${vals.length}`); }
  vals.push(articleSearch({ ...cur, ...a })); sets.push(`search = $${vals.length}`); vals.push(id);
  await sql.query(`update articles set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  revalidatePath("/teachings/articles"); revalidatePath(`/teachings/articles/${cur.slug}`); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from articles where id = ${id}`; revalidatePath("/teachings/articles"); return json({ ok: true }); }
