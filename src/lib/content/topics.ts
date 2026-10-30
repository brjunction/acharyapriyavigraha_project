/* Topics (the Tattva tree): names kept in vocab (kind 'topic') with { parent, description, aliases } in extra.
   Quotes, lectures, videos and articles are linked to topics by name in their `topics` lists. */
import { unstable_cache } from "next/cache";
import { sql, hasDb } from "@/lib/db";
import { slugify } from "./text";

export type Topic = { name: string; slug: string; parent: string | null; description: string | null; counts: { quotes: number; compilations: number; lectures: number; videos: number; articles: number }; total: number };
const q = async (p: Promise<any[]>) => { try { return await p; } catch { return []; } };

async function build(): Promise<Topic[]> {
  if (!hasDb()) return [];
  const [v, ex, qu, au, vi, ar] = await Promise.all([
    q(sql`select name, extra from vocab where kind = 'topic' order by name`),
    q(sql`select t, count(*)::int n from (select unnest(topics) t from excerpts where status = 'published' and kind <> 'quote') x group by 1`),
    q(sql`select t, count(*)::int n from (select unnest(topics) t from excerpts where status = 'published' and kind = 'quote') x group by 1`),
    q(sql`select t, count(*)::int n from (select unnest(topics) t from audios where status = 'published') x group by 1`),
    q(sql`select t, count(*)::int n from (select unnest(topics) t from videos where status = 'published') x group by 1`),
    q(sql`select t, count(*)::int n from (select unnest(topics) t from articles where status = 'published') x group by 1`),
  ]);
  const m = (rows: any[]) => Object.fromEntries(rows.map((r) => [r.t, r.n]));
  const E = m(ex), Q = m(qu), A = m(au), V = m(vi), R = m(ar);
  const names = new Set<string>([...v.map((r: any) => r.name), ...Object.keys(Q), ...Object.keys(E), ...Object.keys(A), ...Object.keys(V), ...Object.keys(R)]);
  return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b)).map((name) => {
    const x = (v.find((r: any) => r.name === name)?.extra || {}) as any; const counts = { quotes: Q[name] || 0, compilations: E[name] || 0, lectures: A[name] || 0, videos: V[name] || 0, articles: R[name] || 0 };
    return { name, slug: slugify(name), parent: x.parent || null, description: x.description || null, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
  });
}
export const topics = unstable_cache(build, ["topics-v1"], { revalidate: 300, tags: ["topics"] });
export const childrenOf = (all: Topic[], name: string | null) => all.filter((t) => (t.parent || null) === name);
/** Everything linked to one topic (and to the topics under it). */
export async function topicContent(names: string[]) {
  if (!hasDb()) return { quotes: [], compilations: [], lectures: [], videos: [], articles: [] };
  const [quotes, compilations, lectures, videos, articles] = await Promise.all([
    q(sql`select e.slug, e.text, e.title, e.source, e.verse_ref, a.title as lecture, a.slug as lslug, a.date from excerpts e left join audios a on a.id = e.audio_id where e.status = 'published' and e.kind = 'quote' and e.topics && ${names} order by e.position, e.created_at limit 300`),
    q(sql`select e.slug, e.kind, e.title, e.text, e.source from excerpts e where e.status = 'published' and e.kind <> 'quote' and e.topics && ${names} order by e.kind, e.position limit 200`),
    q(sql`select slug, title, kind, type, date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, transcript_status from audios where status = 'published' and topics && ${names} order by date desc nulls last limit 200`),
    q(sql`select slug, title, date, youtube_id from videos where status = 'published' and topics && ${names} order by date desc nulls last limit 60`),
    q(sql`select slug, title, author, summary, date from articles where status = 'published' and topics && ${names} order by date desc nulls last limit 60`),
  ]);
  return { quotes, compilations, lectures, videos, articles };
}
