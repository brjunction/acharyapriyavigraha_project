import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { cleanEvent, eventSearch, eventSlug } from "@/lib/content/timeline";

type C = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: C) { const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params; const r = await sql`select * from life_events where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
export async function PATCH(req: Request, { params }: C) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const cur = (await sql`select * from life_events where id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const o = cleanEvent(b); const all = { ...cur, ...o, people: o.people ?? cur.people };
  if (o.title !== undefined && !String(o.title || "").trim()) return fail("The title cannot be empty.");
  const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(o)) { vals.push(v); sets.push(`${k} = $${vals.length}${k === "links" ? "::jsonb" : ""}`); }
  if ((o.title && o.title !== cur.title) || (o.year && o.year !== cur.year)) { vals.push(await eventSlug(all, id)); sets.push(`slug = $${vals.length}`); }
  vals.push(eventSearch(all)); sets.push(`search = $${vals.length}`); vals.push(id);
  await sql.query(`update life_events set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals); revalidatePath("/gurudeva/timeline"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: C) { const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from life_events where id = ${id}`; revalidatePath("/gurudeva/timeline"); return json({ ok: true }); }
