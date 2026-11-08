import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { fileTitle, nextCode, validCode } from "@/lib/content/audio-names";
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
  if ("code" in a) a.code = validCode(a.code); if ("file_title" in a && a.file_title) a.file_title = String(a.file_title).replace(/\.mp3$/i, "");
  if (!cur.file_title && !a.file_title) a.file_title = fileTitle({ ...cur, ...a });
  if (!cur.code && !a.code) a.code = await nextCode({ ...cur, ...a }, id);
  if (a.code && (await sql`select 1 from audios where code = ${a.code} and id <> ${id}`).length) return fail(`The address code ${a.code} is already used by another recording.`);
  if (a.audio_url) { const d = (await sql`select title from audios where audio_url = ${a.audio_url} and id <> ${id} limit 1`)[0] as any; if (d) return fail(`This MP3 link is already used by “${d.title}”. Each recording is kept once.`); }
  const merged = { ...cur, ...a };
  const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
  if (Array.isArray(b.transcript)) { vals.push(JSON.stringify(b.transcript)); sets.push(`transcript = $${vals.length}::jsonb`); }
  // the automatic transcription (e.g. TwinMind), edited in the Studio like the devotees' one
  if (Array.isArray(b.machine_transcript)) { vals.push(b.machine_transcript.length ? JSON.stringify(b.machine_transcript) : null); sets.push(`machine_transcript = $${vals.length}::jsonb`); if (b.machine_transcript.length && !cur.machine_at) sets.push(`machine_at = now()`); }
  if (typeof b.machine_source === "string") { vals.push(b.machine_source.slice(0, 60) || null); sets.push(`machine_source = $${vals.length}`); }
  // which transcription visitors see: best (devotees' if any, else automatic) · devotee · machine · both (a switch)
  if (["best", "devotee", "machine", "both"].includes(b.transcript_show)) { vals.push(b.transcript_show); sets.push(`transcript_show = $${vals.length}`); }
  vals.push(`${searchText(merged)} ${fold(docText(((t) => (t.length ? t : Array.isArray(b.machine_transcript) ? b.machine_transcript : cur.machine_transcript || []))(Array.isArray(b.transcript) ? b.transcript : cur.transcript || []), 400000))}`.trim()); sets.push(`search = $${vals.length}`);
  vals.push(id); await sql.query(`update audios set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  await rememberVocab(a); revalidatePath("/teachings/audio"); revalidatePath(`/teachings/audio/${cur.slug}`); revalidatePath("/teachings/kirtans"); if (merged.code) revalidatePath(`/audios/${merged.code}`);
  return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from audios where id = ${id}`; revalidatePath("/teachings/audio"); return json({ ok: true });
}
