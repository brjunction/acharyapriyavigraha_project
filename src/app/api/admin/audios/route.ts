import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { clean, searchText, uniqueSlug, slugBase, rememberVocab } from "@/lib/content/audios";

/** Lists recordings with filters. ?kind=lecture|songs&q=&year=&place=&scripture=&series=&topic=&status=&need=audio|transcript|date|place&sort=new|old|title|updated&page=1 */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const p = (k: string) => u.get(k) || null;
  const songs = p("kind") === "songs"; const q = p("q") ? `%${fold(p("q"))}%` : null; const page = Math.max(1, Number(p("page")) || 1); const per = Math.min(200, Number(p("per")) || 50);
  const need = p("need"); const sort = p("sort") || "new";
  const rows = await sql`select id, slug, kind, title, date, date_note, place, country, scripture, canto, chapter, verse, series, topics, duration_sec, audio_url, transcript_status, status, updated_at, count(*) over() as total
    from audios where (kind in ('kirtan','bhajan')) = ${songs}
      and (${q}::text is null or search like ${q}) and (${p("year")}::text is null or extract(year from date)::text = ${p("year")})
      and (${p("place")}::text is null or place = ${p("place")}) and (${p("scripture")}::text is null or scripture = ${p("scripture")})
      and (${p("series")}::text is null or series = ${p("series")}) and (${p("topic")}::text is null or ${p("topic")} = any(topics)) and (${p("status")}::text is null or status = ${p("status")})
      and (${need}::text is null or (${need} = 'audio' and audio_url is null) or (${need} = 'transcript' and transcript_status <> 'done') or (${need} = 'date' and date is null) or (${need} = 'place' and place is null))
    order by case when ${sort} = 'new' then date end desc nulls last, case when ${sort} = 'old' then date end asc nulls last, case when ${sort} = 'title' then title end asc, case when ${sort} = 'updated' then updated_at end desc, title
    limit ${per} offset ${(page - 1) * per}`;
  const facets = await sql`select extract(year from date)::int as year, count(*)::int as n from audios where (kind in ('kirtan','bhajan')) = ${songs} and date is not null group by 1 order by 1 desc`;
  const places = await sql`select place as name, count(*)::int as n from audios where (kind in ('kirtan','bhajan')) = ${songs} and place is not null group by 1 order by 1`;
  const series = await sql`select series as name, count(*)::int as n from audios where (kind in ('kirtan','bhajan')) = ${songs} and series is not null group by 1 order by 1`;
  const totals = (await sql`select count(*)::int as all, count(*) filter (where audio_url is null)::int as no_audio, count(*) filter (where transcript_status <> 'done')::int as no_text, count(*) filter (where date is null)::int as no_date from audios where (kind in ('kirtan','bhajan')) = ${songs}`)[0];
  return json({ rows: rows.map(({ total, ...r }) => r), total: Number(rows[0]?.total || 0), years: facets, places, series, totals });
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json(); const a = clean(b); if (!a.title) return fail("Give the recording a title.");
  if (g.user.role === "contributor") a.status = "draft";
  const slug = await uniqueSlug(slugBase(a));
  const cols = Object.keys(a); const r = await sql.query(`insert into audios (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(", ")}) returning id, slug`, [slug, searchText(a), ...cols.map((k) => a[k])]);
  await rememberVocab(a); return json(r[0]);
}
