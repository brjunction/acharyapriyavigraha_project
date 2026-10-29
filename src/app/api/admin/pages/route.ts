import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";
import { pageTemplate } from "@/lib/cms/templates";

export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select id, parent_id, slug, path, title, type, template, status, position, updated_at, settings->>'icon' as icon from pages order by position, title`);
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json();
  const t = pageTemplate(b.template || "blank");
  const parent = b.parent_id ? (await sql`select id, path, type from pages where id = ${b.parent_id}`)[0] : null;
  const title = String(b.title || "Untitled").slice(0, 200);
  let slug = slugify(b.slug || title), n = 1;
  const base = parent ? parent.path : "";
  while ((await sql`select 1 from pages where path = ${`${base}/${slug}`}`).length) slug = `${slugify(b.slug || title)}-${++n}`;
  const type = parent?.type === "book" || parent?.type === "chapter" ? "chapter" : t.type;
  const blocks = t.blocks();
  const pos = Number((await sql`select coalesce(max(position),0)+1 as p from pages where parent_id is not distinct from ${b.parent_id || null}`)[0].p);
  const r = await sql`insert into pages (parent_id, slug, path, title, type, template, blocks, position, created_by, updated_by)
    values (${b.parent_id || null}, ${slug}, ${`${base}/${slug}`}, ${title}, ${type}, ${t.key}, ${JSON.stringify(blocks)}::jsonb, ${pos}, ${g.user.id}, ${g.user.id}) returning id, path`;
  return json(r[0]);
}
