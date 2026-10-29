import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";
const COLS = ["date", "title", "kind", "fasting", "paran", "description", "location", "link", "status"];
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const sets: string[] = []; const vals: any[] = []; for (const k of COLS) if (k in b) { vals.push(b[k] === "" ? null : b[k]); sets.push(`${k} = $${vals.length}`); }
  if (sets.length) { vals.push(id); await sql.query(`update calendar_events set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals); }
  revalidatePath("/resources/vaishnava-calendar"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from calendar_events where id = ${id}`; revalidatePath("/resources/vaishnava-calendar"); return json({ ok: true }); }
