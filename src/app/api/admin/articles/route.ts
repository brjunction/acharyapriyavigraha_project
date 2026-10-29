import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { revalidatePath } from "next/cache";
import { cleanArticle, articleSearch, articleSlug } from "@/lib/content/articles";

/** ?q=&author=&series=&section=&status= — list with the author, series and section lists. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const p = (k: string) => u.get(k) || null; const q = p("q") ? `%${fold(p("q"))}%` : null;
  const rows = await sql`select id, slug, title, subtitle, author, series, series_part, section, date, status, cover, updated_at, jsonb_array_length(body) as blocks from articles
    where (${q}::text is null or search like ${q}) and (${p("author")}::text is null or author = ${p("author")}) and (${p("series")}::text is null or series = ${p("series")})
      and (${p("section")}::text is null or section = ${p("section")}) and (${p("status")}::text is null or status = ${p("status")})
    order by series nulls last, series_part nulls last, date desc nulls last, title limit 1000`;
  const facet = async (c: "author" | "series" | "section") => (await sql.query(`select ${c} as name, count(*)::int as n from articles where ${c} is not null group by 1 order by 1`)) as { name: string; n: number }[];
  return json({ rows, authors: await facet("author"), series: await facet("series"), sections: await facet("section") });
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const a = cleanArticle(await req.json()); if (!a.title) return fail("Give the article a title.");
  if (g.user.role === "contributor") a.status = "draft";
  const cols = Object.keys(a);
  const r = await sql.query(`insert into articles (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((k, i) => (k === "body" ? `$${i + 3}::jsonb` : `$${i + 3}`)).join(", ")}) returning id, slug`, [await articleSlug(a.title), articleSearch(a), ...cols.map((k) => a[k])]);
  revalidatePath("/teachings/articles"); return json(r[0]);
}
