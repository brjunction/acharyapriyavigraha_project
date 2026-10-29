import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const { id } = await params; const row = new URL(req.url).searchParams.get("row");
  const r = await sql`select id, slug, title, data, status, position, blocks from db_rows where db_id = ${id} and id = ${row}`; return r[0] ? json(r[0]) : fail("Not found", 404);
}
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const title = String(b.title || "").trim() || "Untitled";
  let slug = slugify(title), n = 1; while ((await sql`select 1 from db_rows where db_id = ${id} and slug = ${slug}`).length) slug = `${slugify(title)}-${++n}`;
  const r = await sql`insert into db_rows (db_id, slug, title, data, status) values (${id}, ${slug}, ${title}, ${JSON.stringify(b.data || {})}::jsonb, ${g.user.role === "contributor" ? "draft" : "published"}) returning id, slug, title, data, status, position`;
  return json(r[0]);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!b.row) return fail("Missing row.");
  const { id } = await params;
  if (b.title && String(b.title).trim()) {
    const cur = (await sql`select slug from db_rows where id = ${b.row}`)[0];
    if (cur && String(cur.slug || "").startsWith("untitled")) { let s2 = slugify(b.title), n = 1; while ((await sql`select 1 from db_rows where db_id = ${id} and slug = ${s2} and id <> ${b.row}`).length) s2 = `${slugify(b.title)}-${++n}`; await sql`update db_rows set slug = ${s2} where id = ${b.row}`; }
  }
  await sql`update db_rows set title = coalesce(${b.title ?? null}, title), data = coalesce(${b.data ? JSON.stringify(b.data) : null}::jsonb, data), status = coalesce(${g.user.role === "contributor" ? null : b.status ?? null}, status), blocks = coalesce(${b.blocks ? JSON.stringify(b.blocks) : null}::jsonb, blocks), position = coalesce(${b.position ?? null}, position), updated_at = now() where id = ${b.row}`;
  return json({ ok: true });
}
export async function DELETE(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); await sql`delete from db_rows where id = ${b.row}`; return json({ ok: true });
}
