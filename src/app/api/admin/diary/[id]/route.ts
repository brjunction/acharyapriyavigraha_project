import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { COLS, dsearch } from "@/lib/content/diary";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params; const r = await sql`select * from diary_entries where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const cur = (await sql`select * from diary_entries where id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const sets: string[] = []; const vals: any[] = []; for (const k of COLS) if (k in b) { vals.push(b[k] === "" ? null : k === "position" ? Number(b[k]) || 0 : b[k]); sets.push(`${k} = $${vals.length}`); }
  vals.push(dsearch({ ...cur, ...b })); sets.push(`search = $${vals.length}`); vals.push(id);
  await sql.query(`update diary_entries set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals); revalidatePath("/gurudeva/diaries"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from diary_entries where id = ${id}`; revalidatePath("/gurudeva/diaries"); return json({ ok: true }); }
