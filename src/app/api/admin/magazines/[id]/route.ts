import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/content/text";

/** One magazine with its issues (and how many articles each issue has). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params;
  const m = (await sql`select * from magazines where id = ${id}`)[0]; if (!m) return fail("Not found", 404);
  const issues = await sql`select i.*, to_char(i.date, 'YYYY-MM-DD') as day, (select count(*)::int from articles a where a.issue_id = i.id) as n_articles from magazine_issues i where i.magazine_id = ${id} order by i.date desc nulls last, i.position desc, i.number desc`;
  return json({ magazine: m, issues });
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const title = String(b.title || "").trim(); if (!title) return fail("Give the magazine a name.");
  const slug = b.slug ? slugify(b.slug) : null;
  try { await sql`update magazines set title = ${title}, slug = coalesce(${slug}, slug, ${slugify(title)}), publisher = ${b.publisher || null}, description = ${b.description || null}, cover = ${b.cover || null}, url = ${b.url || null}, status = ${b.status || "published"}, updated_at = now() where id = ${id}`; } catch { return fail("Another magazine already uses that address."); }
  revalidatePath("/teachings/magazines", "layout"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params;
  await sql`delete from magazines where id = ${id}`; revalidatePath("/teachings/magazines", "layout"); return json({ ok: true });
}
