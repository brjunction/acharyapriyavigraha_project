/* Reads the standard databases (audio lectures, videos) for the public library pages. */
import { sql, hasDb } from "@/lib/db";
import type { Lecture } from "@/lib/data";

type F = { key: string; label: string; type: string };
const pick = (fields: F[], data: Record<string, any>, ...names: string[]) => {
  for (const n of names) { const f = fields.find((x) => x.key === n || x.label.toLowerCase() === n); if (f && data[f.key] !== undefined && data[f.key] !== "") return data[f.key]; }
  return undefined;
};
const dur = (v: any) => { if (typeof v === "number") return v > 400 ? v : v * 60; const m = /^(?:(\d+):)?(\d+):(\d+)$/.exec(String(v || "")); return m ? (Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3])) : Number(v) * 60 || 0; };

export async function dbRows(slug: string) {
  if (!hasDb()) return null;
  try {
    const d = (await sql`select id, slug, fields from dbs where slug = ${slug} and public`)[0]; if (!d) return null;
    const rows = await sql`select title, slug, data from db_rows where db_id = ${d.id} and status = 'published' order by position, created_at desc limit 20000`;
    return { slug: d.slug as string, fields: (d.fields || []) as F[], rows: rows as { title: string; slug: string; data: Record<string, any> }[] };
  } catch { return null; }
}

import { verseRef } from "@/lib/content/text";
type ARow = { slug: string; title: string; kind: string; date: string | null; date_note: string | null; place: string | null; country: string | null; scripture: string | null; canto: number | null; chapter: number | null; verse: string | null; language: string | null; series: string | null; topics: string[]; duration_sec: number | null; audio_url: string | null; transcript_status: string; summary?: string | null };
const KIND: Record<string, string> = { lecture: "Lecture", darshan: "Darśana", seminar: "Seminar", festival: "Festival", qa: "Questions & answers", initiation: "Initiation", kirtan: "Kīrtana", bhajan: "Bhajana", other: "Other" };
export const toLecture = (r: ARow): Lecture => (({
  slug: r.slug, title: r.title, date: r.date ? String(r.date).slice(0, 10) : "", place: r.place || "", country: r.country || "", type: (r as any).type || KIND[r.kind] || "Lecture",
  scripture: verseRef(r) || undefined, duration: r.duration_sec || 0, transcribed: r.transcript_status === "done", languages: r.language ? [r.language] : [], topics: r.topics || [],
  series: r.series || undefined, url: r.audio_url || undefined, href: `/teachings/audio/${r.slug}`,
  ...((r as any).singer ? { singer: (r as any).singer } : {}), ...((r as any).song_author ? { author: (r as any).song_author } : {}), ...((r as any).song ? { song: (r as any).song } : {}),
}) as Lecture);
/** Published recordings from the Audio panel. songs = kīrtanas and bhajanas. Null when there are none yet. */
export async function getLectures(songs = false): Promise<Lecture[] | null> {
  if (!hasDb()) return null;
  try {
    const rows = await sql`select slug, title, kind, type, date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, transcript_status, song, song_author, singer from audios where status = 'published' and (kind in ('kirtan','bhajan')) = ${songs} order by date desc nulls last, title limit 20000`;
    return rows.length ? (rows as ARow[]).map(toLecture) : null;
  } catch { return null; }
}
export async function getAudio(slug: string) {
  if (!hasDb()) return null;
  try { return ((await sql`select * from audios where slug = ${slug} and status = 'published'`)[0] as any) || null; } catch { return null; }
}

const VKIND: Record<string, string> = { lecture: "Lecture", kirtan: "Kīrtana", festival: "Festival", darshan: "Darśana", memory: "Memory", short: "Short", other: "Other" };
/** Published videos as library items. */
export async function getVideos() {
  if (!hasDb()) return [];
  try {
    const rows = (await sql`select slug, title, kind, type, date, year, place, country, scripture, language, series, channel, topics, duration_sec, youtube_id from videos where status = 'published' order by date desc nulls last, title limit 20000`) as any[];
    return rows.map((v) => ({ slug: v.slug, title: v.title, date: v.date ? String(v.date instanceof Date ? v.date.toISOString() : v.date).slice(0, 10) : v.year ? String(v.year) : "", place: v.place || "", country: v.country || "", type: v.type || VKIND[v.kind] || "Video",
      scripture: v.scripture || undefined, duration: v.duration_sec || 0, transcribed: false, languages: v.language ? [v.language] : [], topics: v.topics || [], series: v.series || v.channel || undefined,
      href: `/teachings/videos/${v.slug}`, thumb: v.youtube_id ? `https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg` : undefined, video: true }));
  } catch { return []; }
}

export async function getVideo(slug: string) {
  if (!hasDb()) return null;
  try { return ((await sql`select v.*, to_char(v.date, 'YYYY-MM-DD') as day, a.slug as audio_slug, a.title as audio_title from videos v left join audios a on a.id = v.audio_id where v.slug = ${slug} and v.status = 'published'`)[0] as any) || null; } catch { return null; }
}
