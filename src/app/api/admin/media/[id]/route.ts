import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  await sql`update media set alt = ${String(b.alt || "")} where id = ${id}`; return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from media where id = ${id}`; return json({ ok: true });
}
