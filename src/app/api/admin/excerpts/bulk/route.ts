import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { EXCERPT, insertRow, cleanBy } from "@/lib/content/generic";

export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.import)) { let added = 0; for (const x of b.import.slice(0, 500)) if (x.text || x.original || x.title) { await insertRow(EXCERPT, x); added++; } return json({ added }); }
  const ids: string[] = b.ids || []; if (!ids.length) return fail("Choose some entries first.");
  if (b.delete) await sql`delete from excerpts where id = any(${ids})`;
  if (b.addTopic) await sql`update excerpts set topics = array_append(topics, ${b.addTopic}) where id = any(${ids}) and not (${b.addTopic} = any(topics))`;
  if (b.set) { const a = cleanBy(EXCERPT, b.set); const sets: string[] = []; const vals: any[] = []; for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); } if (sets.length) { vals.push(ids); await sql.query(`update excerpts set ${sets.join(", ")} where id = any($${vals.length})`, vals); } }
  if (b.order) for (const [i, id] of (b.order as string[]).entries()) await sql`update excerpts set position = ${i} where id = ${id}`;
  return json({ ok: true });
}
