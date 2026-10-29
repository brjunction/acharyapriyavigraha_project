import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  if (!String(b.title || "").trim()) return fail("Give the magazine a name.");
  await sql`update magazines set title = ${b.title.trim()}, publisher = ${b.publisher || null}, description = ${b.description || null}, cover = ${b.cover || null}, url = ${b.url || null}, issues = ${JSON.stringify(b.issues || [])}::jsonb, status = ${b.status || "published"}, updated_at = now() where id = ${id}`;
  revalidatePath("/teachings/magazines"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from magazines where id = ${id}`; revalidatePath("/teachings/magazines"); return json({ ok: true }); }
