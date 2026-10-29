import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { clean, searchText, rememberVocab } from "@/lib/content/audios";
import { fold } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const { id } = await params; const r = await sql`select * from audios where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const cur = (await sql`select * from audios where id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const a = clean(b); if (g.user.role === "contributor") delete a.status;
  const merged = { ...cur, ...a };
  const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
  if (Array.isArray(b.transcript)) { vals.push(JSON.stringify(b.transcript)); sets.push(`transcript = $${vals.length}::jsonb`); }
  vals.push(`${searchText(merged)} ${fold(docText(Array.isArray(b.transcript) ? b.transcript : cur.transcript || [], 400000))}`.trim()); sets.push(`search = $${vals.length}`);
  vals.push(id); await sql.query(`update audios set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  await rememberVocab(a); revalidatePath("/teachings/audio"); revalidatePath(`/teachings/audio/${cur.slug}`); revalidatePath("/teachings/kirtans");
  return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from audios where id = ${id}`; revalidatePath("/teachings/audio"); return json({ ok: true });
}
