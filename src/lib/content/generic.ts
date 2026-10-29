/* Shared helpers for the videos and compilations tables. */
import { sql } from "@/lib/db";
import { fold, slugify } from "./text";

type Spec = { table: "videos" | "excerpts"; cols: string[]; ints: string[]; arrays: string[]; dates: string[]; search: (r: Record<string, any>) => string; slug: (r: Record<string, any>) => string };
export const yt = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/.exec(u || "")?.[1] || (/^[\w-]{11}$/.test(u || "") ? u : "");

export const VIDEO: Spec = {
  table: "videos", cols: ["kind", "title", "date", "youtube_id", "url", "place", "language", "series", "topics", "duration_sec", "description", "channel", "audio_id", "status", "position"], ints: ["duration_sec", "position"], arrays: ["topics"], dates: ["date"],
  search: (r) => fold([r.title, r.date, r.place, r.series, (r.topics || []).join(" "), r.description, r.channel].filter(Boolean).join(" ")), slug: (r) => [r.title, r.date?.slice?.(0, 4)].filter(Boolean).join(" "),
};
export const EXCERPT: Spec = {
  table: "excerpts", cols: ["kind", "title", "text", "audio_id", "at_sec", "source", "verse_ref", "original", "transliteration", "translation", "author", "date", "day_of_year", "topics", "status", "position"], ints: ["at_sec", "day_of_year", "position"], arrays: ["topics"], dates: ["date"],
  search: (r) => fold([r.title, r.text, r.source, r.verse_ref, r.original, r.transliteration, r.translation, r.author, (r.topics || []).join(" ")].filter(Boolean).join(" ")), slug: (r) => r.title || String(r.text || r.verse_ref || "untitled").split(/\s+/).slice(0, 8).join(" "),
};

export function cleanBy(s: Spec, b: Record<string, any>) {
  const o: Record<string, any> = {};
  for (const k of s.cols) if (k in b) {
    let v = b[k];
    if (s.ints.includes(k)) v = v === "" || v === null || v === undefined ? null : Number(v) || null;
    else if (s.arrays.includes(k)) v = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : String(v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    else if (s.dates.includes(k)) v = v ? String(v).slice(0, 10) : null;
    else if (k === "audio_id") v = v && /^[0-9a-f-]{36}$/.test(v) ? v : null;
    else v = v === undefined || v === null ? null : String(v).trim() || null;
    o[k] = v;
  }
  if (s.table === "videos" && (o.url || o.youtube_id)) o.youtube_id = yt(o.youtube_id || o.url) || o.youtube_id || null;
  if (s.table === "excerpts" && "text" in o && o.text === null) o.text = "";
  if (s.table === "excerpts" && "title" in o && o.title === null) o.title = "";
  return o;
}
export async function slugFor(s: Spec, base: string, id?: string) {
  let x = slugify(base), n = 1; const b = x;
  while ((await sql.query(`select 1 from ${s.table} where slug = $1 and id is distinct from $2`, [x, id ?? null])).length) x = `${b}-${++n}`;
  return x;
}
export async function insertRow(s: Spec, raw: Record<string, any>) {
  const a = cleanBy(s, raw); const slug = await slugFor(s, s.slug(a)); const cols = Object.keys(a);
  const r = await sql.query(`insert into ${s.table} (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(", ")}) returning id, slug`, [slug, s.search(a), ...cols.map((k) => a[k])]);
  return r[0];
}
export async function updateRow(s: Spec, id: string, raw: Record<string, any>) {
  const cur = (await sql.query(`select * from ${s.table} where id = $1`, [id]))[0]; if (!cur) return null;
  const a = cleanBy(s, raw); const sets: string[] = []; const vals: any[] = [];
  for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
  vals.push(s.search({ ...cur, ...a })); sets.push(`search = $${vals.length}`); vals.push(id);
  await sql.query(`update ${s.table} set ${sets.join(", ")}, updated_at = now() where id = $${vals.length}`, vals);
  return cur;
}
export async function rememberTopics(topics?: string[]) { if (topics?.length) await sql`insert into vocab (kind, name) select 'topic', x from unnest(${topics}::text[]) as x on conflict do nothing`; }
