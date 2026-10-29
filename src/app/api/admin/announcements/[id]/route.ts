import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  await sql`update announcements set title = ${b.title}, body = ${b.body || ""}, kind = ${b.kind || "notice"}, cta_label = ${b.cta_label || null}, cta_url = ${b.cta_url || null}, starts_at = ${b.starts_at || null}, ends_at = ${b.ends_at || null}, active = ${b.active !== false} where id = ${id}`;
  return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from announcements where id = ${id}`; return json({ ok: true });
}
