import { cache } from "react";
import { sql, hasDb } from "@/lib/db";
import { slugify } from "./text";

export type Author = { name: string; slug: string; photo: string | null; role: string | null; bio: string | null; n: number };
export type ACard = { slug: string; title: string; subtitle: string | null; author: string | null; series: string | null; series_part: number | null; section: string | null; date: string | null; summary: string | null; cover: string | null; topics: string[] | null; minutes: number; mag: string | null; mag_slug: string | null; issue: string | null; issue_slug: string | null };

const q = async <T,>(p: Promise<any[]>) => { try { return (await p) as T[]; } catch { return [] as T[]; } };

/** Every published article, with its magazine issue if it has one. Filtering happens in the browser. */
export const allArticles = cache(async () => {
  if (!hasDb()) return [] as ACard[];
  return q<ACard>(sql`select a.slug, a.title, a.subtitle, a.author, a.series, a.series_part, a.section, to_char(a.date, 'YYYY-MM-DD') as date, a.summary, a.cover, a.topics,
    greatest(1, round(length(coalesce(a.search, '')) / 1100.0))::int as minutes, m.title as mag, m.slug as mag_slug, coalesce(i.title, i.number) as issue, i.slug as issue_slug
    from articles a left join magazine_issues i on i.id = a.issue_id left join magazines m on m.id = i.magazine_id
    where a.status = 'published' order by a.date desc nulls last, a.title limit 5000`);
});
/** Authors: everyone who has written an article, with the photo and line about them set in the Studio. */
export const allAuthors = cache(async () => {
  if (!hasDb()) return [] as Author[];
  const [meta, counts] = await Promise.all([q<any>(sql`select name, extra from vocab where kind = 'author'`), q<any>(sql`select author as name, count(*)::int n from articles where status = 'published' and author is not null group by 1`)]);
  const names = new Set([...meta.map((m) => m.name), ...counts.map((c) => c.name)]);
  return [...names].map((name) => { const m = meta.find((x) => x.name === name)?.extra || {}; return { name, slug: slugify(name), photo: m.photo || null, role: m.role || null, bio: m.bio || null, n: counts.find((c) => c.name === name)?.n || 0, pos: m.position ?? 999 }; })
    .filter((a) => a.n > 0).sort((a, b) => a.pos - b.pos || b.n - a.n).map(({ pos: _p, ...a }) => a as Author);
});
export async function getArticle(slug: string) {
  if (!hasDb()) return null;
  try { return ((await sql`select a.*, to_char(a.date, 'YYYY-MM-DD') as day, greatest(1, round(length(coalesce(a.search, '')) / 1100.0))::int as minutes, m.title as mag, m.slug as mag_slug, m.cover as mag_cover, coalesce(i.title, i.number) as issue, i.slug as issue_slug, i.cover as issue_cover from articles a left join magazine_issues i on i.id = a.issue_id left join magazines m on m.id = i.magazine_id where a.slug = ${slug} and a.status = 'published'`)[0] as any) || null; } catch { return null; }
}
export async function related(a: any) {
  const [series, byAuthor, inIssue] = await Promise.all([
    a.series ? q<any>(sql`select slug, title, series_part from articles where status = 'published' and series = ${a.series} order by series_part nulls last, date, title`) : [],
    a.author ? q<any>(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date from articles where status = 'published' and author = ${a.author} and slug <> ${a.slug} and (series is distinct from ${a.series ?? null}) order by date desc nulls last limit 5`) : [],
    a.issue_id ? q<any>(sql`select slug, title, author from articles where status = 'published' and issue_id = ${a.issue_id} order by issue_position nulls last, title`) : [],
  ]);
  return { series, byAuthor, inIssue };
}

export type Mag = { id: string; slug: string; title: string; publisher: string | null; description: string | null; cover: string | null; url: string | null; n_issues: number; first: number | null; last: number | null; latest: { slug: string; label: string; cover: string | null }[] };
export const listMagazines = cache(async () => {
  if (!hasDb()) return [] as Mag[];
  const mags = await q<any>(sql`select m.id, coalesce(m.slug, m.id::text) slug, m.title, m.publisher, m.description, m.cover, m.url, (select count(*)::int from magazine_issues i where i.magazine_id = m.id and i.status = 'published') n_issues, (select min(year) from magazine_issues i where i.magazine_id = m.id and i.status = 'published') "first", (select max(year) from magazine_issues i where i.magazine_id = m.id and i.status = 'published') "last" from magazines m where m.status = 'published' order by m.position, m.title`);
  const latest = await q<any>(sql`select magazine_id, slug, coalesce(title, number) label, cover from (select *, row_number() over (partition by magazine_id order by date desc nulls last, position desc) r from magazine_issues where status = 'published') x where r <= 6`);
  return mags.map((m) => ({ ...m, latest: latest.filter((l) => l.magazine_id === m.id) })) as Mag[];
});
export const getMagazine = cache(async (slug: string) => {
  if (!hasDb()) return null;
  const m = (await q<any>(sql`select * from magazines where (slug = ${slug} or id::text = ${slug}) and status = 'published'`))[0]; if (!m) return null;
  const issues = await q<any>(sql`select i.id, i.slug, i.number, i.title, to_char(i.date, 'YYYY-MM-DD') date, i.year, i.cover, i.pdf_url, i.url, i.description, (select count(*)::int from articles a where a.issue_id = i.id and a.status = 'published') n from magazine_issues i where i.magazine_id = ${m.id} and i.status = 'published' order by i.date desc nulls last, i.position desc`);
  return { magazine: { ...m, slug: m.slug || m.id }, issues };
});
export async function getIssue(mag: string, issue: string) {
  const r = await getMagazine(mag); if (!r) return null;
  const k = r.issues.findIndex((i: any) => i.slug === issue); if (k < 0) return null; const i = r.issues[k];
  const articles = await q<any>(sql`select slug, title, subtitle, author, summary, section, greatest(1, round(length(coalesce(search, '')) / 1100.0))::int as minutes from articles where issue_id = ${i.id} and status = 'published' order by issue_position nulls last, title`);
  return { ...r, issue: i, articles, newer: r.issues[k - 1] || null, older: r.issues[k + 1] || null };
}
