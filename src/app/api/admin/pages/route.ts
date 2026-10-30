import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";
import { pageTemplate } from "@/lib/cms/templates";
import { isDynamic } from "@/lib/cms/dynamic";

export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const at = new URL(req.url).searchParams.get("path");
  if (at) return json((await sql`select id, title, status from pages where path = ${at}`)[0] || null);
  return json(await sql`select id, parent_id, slug, path, title, type, template, status, position, updated_at, settings->>'icon' as icon, settings->>'redirect' as redirect, coalesce(settings->>'studio', 'on') as studio from pages order by position, title`);
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json();
  const t = pageTemplate(b.template || "blank");
  // Making an editable version of an existing website address: place it at exactly that address.
  if (!b.parent_id && typeof b.path === "string" && /^\/[a-z0-9\/-]+$/.test(b.path)) {
    const segs = b.path.split("/").filter(Boolean); const parentPath = "/" + segs.slice(0, -1).join("/");
    const par = segs.length > 1 ? (await sql`select id from pages where path = ${parentPath}`)[0] : null;
    if (isDynamic(b.path)) return fail("This address is run by Dynamic contents (audio, videos, books…), not by Pages.");
    if ((await sql`select 1 from pages where path = ${b.path}`).length) return fail("A page already exists at that address.");
    const t2 = pageTemplate(b.template || "blank");
    const r2 = await sql`insert into pages (parent_id, slug, path, title, type, template, blocks, position, created_by, updated_by)
      values (${par?.id || null}, ${segs[segs.length - 1]}, ${b.path}, ${String(b.title || "Untitled").slice(0, 200)}, ${t2.type}, ${t2.key}, ${JSON.stringify(t2.blocks())}::jsonb, 0, ${g.user.id}, ${g.user.id}) returning id, path`;
    return json(r2[0]);
  }
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
