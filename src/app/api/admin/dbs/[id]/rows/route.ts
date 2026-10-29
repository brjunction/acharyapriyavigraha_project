import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const title = String(b.title || "").trim() || "Untitled";
  let slug = slugify(title), n = 1; while ((await sql`select 1 from db_rows where db_id = ${id} and slug = ${slug}`).length) slug = `${slugify(title)}-${++n}`;
  const r = await sql`insert into db_rows (db_id, slug, title, data, status) values (${id}, ${slug}, ${title}, ${JSON.stringify(b.data || {})}::jsonb, ${g.user.role === "contributor" ? "draft" : "published"}) returning id, slug`;
  return json(r[0]);
}
export async function PATCH(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!b.row) return fail("Missing row.");
  await sql`update db_rows set title = coalesce(${b.title ?? null}, title), data = coalesce(${b.data ? JSON.stringify(b.data) : null}::jsonb, data), status = coalesce(${g.user.role === "contributor" ? null : b.status ?? null}, status), updated_at = now() where id = ${b.row}`;
  return json({ ok: true });
}
export async function DELETE(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); await sql`delete from db_rows where id = ${b.row}`; return json({ ok: true });
}
