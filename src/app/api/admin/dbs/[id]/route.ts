import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const { id } = await params; const d = (await sql`select * from dbs where id = ${id}`)[0]; if (!d) return fail("Not found", 404);
  const rows = await sql`select id, slug, title, data, status, position from db_rows where db_id = ${id} order by position, created_at desc limit 5000`;
  return json({ db: d, rows });
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  await sql`update dbs set name = coalesce(${b.name ?? null}, name), fields = coalesce(${b.fields ? JSON.stringify(b.fields) : null}::jsonb, fields), public = coalesce(${b.public ?? null}, public), views = coalesce(${b.views ? JSON.stringify(b.views) : null}::jsonb, views), settings = coalesce(${b.settings ? JSON.stringify(b.settings) : null}::jsonb, settings) where id = ${id}`; return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from dbs where id = ${id}`; return json({ ok: true });
}
