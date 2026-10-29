import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { VIDEO, updateRow, rememberTopics } from "@/lib/content/generic";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params; const r = await sql`select v.*, a.title as audio_title from videos v left join audios a on a.id = v.audio_id where v.id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json(); if (g.user.role === "contributor") delete b.status;
  if (!(await updateRow(VIDEO, id, b))) return fail("Not found", 404); await rememberTopics(b.topics); revalidatePath("/teachings/videos"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from videos where id = ${id}`; revalidatePath("/teachings/videos"); return json({ ok: true }); }
