import { sql } from "@/lib/db";
import { fold, slugify, verseRef } from "./text";

export const AUDIO_COLS = ["kind", "title", "date", "date_note", "place", "country", "occasion", "scripture", "canto", "chapter", "verse", "language", "series", "topics", "duration_sec", "audio_url", "audio_url_alt", "song", "song_author", "singer", "summary", "notes", "transcript_status", "status", "position"] as const;
export type Audio = { id: string; slug: string } & Partial<Record<(typeof AUDIO_COLS)[number], any>> & { transcript?: any[] };

export function clean(b: Record<string, any>) {
  const o: Record<string, any> = {};
  for (const k of AUDIO_COLS) if (k in b) {
    let v = b[k];
    if (["canto", "chapter", "duration_sec", "position"].includes(k)) v = v === "" || v === null || v === undefined ? null : Number(v) || null;
    else if (k === "topics") v = Array.isArray(v) ? v.map(String).map((x) => x.trim()).filter(Boolean) : String(v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    else if (k === "date") v = v ? String(v).slice(0, 10) : null;
    else v = v === undefined || v === null ? null : String(v).trim() || null;
    if (k === "audio_url" || k === "audio_url_alt") if (v && !/^https?:\/\//.test(v)) v = null;
    o[k] = v;
  }
  return o;
}
export const searchText = (a: Record<string, any>) => fold([a.title, a.date, a.date_note, a.place, a.country, a.occasion, verseRef(a), a.series, (a.topics || []).join(" "), a.song, a.song_author, a.singer, a.summary].filter(Boolean).join(" "));
export async function uniqueSlug(base: string, id?: string) {
  let s = slugify(base), n = 1; const b = s;
  while ((await sql`select 1 from audios where slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`;
  return s;
}
export const slugBase = (a: Record<string, any>) => [a.date, a.title, a.place].filter(Boolean).join(" ");
/** Keeps the shared lists (places, series, topics…) up to date with what was typed. */
export async function rememberVocab(a: Record<string, any>) {
  const add: [string, string][] = [];
  if (a.place) add.push(["place", a.place]); if (a.series) add.push(["series", a.series]); if (a.occasion) add.push(["occasion", a.occasion]); if (a.singer) add.push(["singer", a.singer]); if (a.country) add.push(["country", a.country]);
  for (const t of a.topics || []) add.push(["topic", t]);
  if (!add.length) return;
  await sql`insert into vocab (kind, name) select x.k, x.n from jsonb_to_recordset(${JSON.stringify(add.map(([k, n]) => ({ k, n })))}::jsonb) as x(k text, n text) on conflict (kind, name) do nothing`;
}
