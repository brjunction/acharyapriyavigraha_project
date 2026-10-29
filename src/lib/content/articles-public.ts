import { sql, hasDb } from "@/lib/db";
import { fold } from "./text";

export type ACard = { slug: string; title: string; subtitle: string | null; author: string | null; series: string | null; series_part: number | null; section: string | null; date: string | null; summary: string | null; cover: string | null };
export async function listArticles(f: { author?: string; series?: string; section?: string; q?: string }) {
  if (!hasDb()) return null;
  try {
    const q = f.q ? `%${fold(f.q)}%` : null;
    const rows = (await sql`select slug, title, subtitle, author, series, series_part, section, to_char(date, 'YYYY-MM-DD') as date, summary, cover from articles where status = 'published'
      and (${f.author || null}::text is null or author = ${f.author || null}) and (${f.series || null}::text is null or series = ${f.series || null}) and (${f.section || null}::text is null or section = ${f.section || null}) and (${q}::text is null or search like ${q})
      order by case when ${f.series || null}::text is not null then series_part end nulls last, date desc nulls last, title`) as ACard[];
    const facet = async (c: string) => (await sql.query(`select ${c} as name, count(*)::int as n from articles where status = 'published' and ${c} is not null group by 1 order by 1`)) as { name: string; n: number }[];
    return { rows, authors: await facet("author"), series: await facet("series"), sections: await facet("section") };
  } catch { return null; }
}
export async function getArticle(slug: string) {
  if (!hasDb()) return null;
  try { return ((await sql`select *, to_char(date, 'YYYY-MM-DD') as day from articles where slug = ${slug} and status = 'published'`)[0] as any) || null; } catch { return null; }
}
export async function related(a: any) {
  try {
    const series = a.series ? ((await sql`select slug, title, series_part from articles where status = 'published' and series = ${a.series} order by series_part nulls last, date, title`) as any[]) : [];
    const byAuthor = a.author ? ((await sql`select slug, title from articles where status = 'published' and author = ${a.author} and slug <> ${a.slug} and (series is distinct from ${a.series ?? null}) order by date desc nulls last limit 6`) as any[]) : [];
    return { series, byAuthor };
  } catch { return { series: [], byAuthor: [] }; }
}
export async function listMagazines() {
  if (!hasDb()) return [];
  try { return (await sql`select id, title, publisher, description, cover, url, issues from magazines where status = 'published' order by position, title`) as any[]; } catch { return []; }
}
