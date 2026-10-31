import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/content/text";

/** Magazines with how many issues and articles each has. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select m.*, (select count(*)::int from magazine_issues i where i.magazine_id = m.id) as n_issues, (select count(*)::int from articles a join magazine_issues i on i.id = a.issue_id where i.magazine_id = m.id) as n_articles from magazines m order by m.position, m.title`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update magazines set position = ${i} where id = ${id}`; revalidatePath("/teachings/magazines"); return json({ ok: true }); }
  const title = String(b.title || "").trim(); if (!title) return fail("Give the magazine a name.");
  let slug = slugify(title), k = 1; const base = slug; while ((await sql`select 1 from magazines where slug = ${slug}`).length) slug = `${base}-${++k}`;
  const n = Number((await sql`select coalesce(max(position), 0) + 1 as n from magazines`)[0].n);
  const r = await sql`insert into magazines (title, slug, publisher, description, cover, url, issues, status, position) values (${title}, ${slug}, ${b.publisher || null}, ${b.description || null}, ${b.cover || null}, ${b.url || null}, '[]'::jsonb, ${b.status || "published"}, ${n}) returning id, slug`;
  revalidatePath("/teachings/magazines"); return json(r[0]);
}
