import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { EXCERPT, updateRow, rememberTopics } from "@/lib/content/generic";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params; const r = await sql`select e.*, a.title as lecture from excerpts e left join audios a on a.id = e.audio_id where e.id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json(); if (g.user.role === "contributor") delete b.status;
  if (!(await updateRow(EXCERPT, id, b))) return fail("Not found", 404); await rememberTopics(b.topics); revalidatePath("/teachings/quotes"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from excerpts where id = ${id}`; return json({ ok: true }); }
