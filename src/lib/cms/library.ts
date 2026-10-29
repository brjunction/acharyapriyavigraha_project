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

export async function getLectures(): Promise<Lecture[] | null> {
  const d = await dbRows("audio-lectures"); if (!d || !d.rows.length) return null;
  return d.rows.map((r) => {
    const g = (...n: string[]) => pick(d.fields, r.data || {}, ...n);
    const arr = (v: any) => (Array.isArray(v) ? v : v ? String(v).split(/,\s*/) : []);
    return {
      slug: r.slug, title: r.title, date: String(g("date") || "").slice(0, 10), place: String(g("place") || ""), country: String(g("country") || ""),
      type: String(g("type", "kind") || "Lecture"), scripture: g("verse", "scripture", "reference") ? String(g("verse", "scripture", "reference")) : undefined,
      duration: dur(g("duration", "length")), transcribed: !!g("transcribed", "transcript"), languages: arr(g("languages", "language")), topics: arr(g("topics", "topic")),
      series: g("series") ? String(g("series")) : undefined, url: g("audio", "mp3", "file") ? String(g("audio", "mp3", "file")) : undefined, href: `/d/${d.slug}/${r.slug}`,
    };
  });
}
