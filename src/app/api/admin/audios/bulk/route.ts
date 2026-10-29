import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { clean, searchText, uniqueSlug, slugBase, rememberVocab } from "@/lib/content/audios";

/** Many recordings at once. { ids, set?: {...}, addTopic?, removeTopic?, delete? } or { import: [...] } (up to 500). */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json();
  if (Array.isArray(b.import)) {
    let added = 0;
    for (const raw of b.import.slice(0, 500)) {
      const a = clean(raw); if (!a.title) continue; a.kind ||= raw.kind || "lecture";
      const slug = await uniqueSlug(slugBase(a)); const cols = Object.keys(a);
      await sql.query(`insert into audios (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(", ")})`, [slug, searchText(a), ...cols.map((k) => a[k])]);
      await rememberVocab(a); added++;
    }
    revalidatePath("/teachings/audio"); return json({ added });
  }
  const ids: string[] = Array.isArray(b.ids) ? b.ids : []; if (!ids.length) return fail("Choose some recordings first.");
  if (b.delete) { await sql`delete from audios where id = any(${ids})`; revalidatePath("/teachings/audio"); return json({ ok: true }); }
  if (b.addTopic) await sql`update audios set topics = array_append(topics, ${b.addTopic}) where id = any(${ids}) and not (${b.addTopic} = any(topics))`;
  if (b.removeTopic) await sql`update audios set topics = array_remove(topics, ${b.removeTopic}) where id = any(${ids})`;
  if (b.set) {
    const a = clean(b.set); const sets: string[] = []; const vals: any[] = [];
    for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
    if (sets.length) { vals.push(ids); await sql.query(`update audios set ${sets.join(", ")}, updated_at = now() where id = any($${vals.length})`, vals); }
    await rememberVocab(a);
  }
  for (const r of await sql`select * from audios where id = any(${ids})`) await sql`update audios set search = ${searchText(r)} where id = ${r.id}`;
  if (b.addTopic) await rememberVocab({ topics: [b.addTopic] });
  revalidatePath("/teachings/audio"); return json({ ok: true });
}
