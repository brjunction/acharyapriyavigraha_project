import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { VIDEO, insertRow, rememberTopics } from "@/lib/content/generic";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const p = (k: string) => u.get(k) || null; const page = Math.max(1, Number(p("page")) || 1);
  const q = p("q") ? `%${fold(p("q"))}%` : null;
  const rows = await sql`select id, slug, kind, title, date, youtube_id, place, series, topics, duration_sec, channel, status, count(*) over() as total from videos
    where (${p("kind")}::text is null or kind = ${p("kind")}) and (${q}::text is null or search like ${q}) and (${p("year")}::text is null or extract(year from date)::text = ${p("year")}) and (${p("status")}::text is null or status = ${p("status")})
    order by date desc nulls last, created_at desc limit 60 offset ${(page - 1) * 60}`;
  const kinds = await sql`select kind, count(*)::int as n from videos group by 1`;
  const years = await sql`select extract(year from date)::int as year, count(*)::int as n from videos where date is not null group by 1 order by 1 desc`;
  return json({ rows: rows.map(({ total, ...r }) => r), total: Number(rows[0]?.total || 0), kinds, years });
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!String(b.title || "").trim()) return fail("Give the video a title.");
  if (g.user.role === "contributor") b.status = "draft";
  const r = await insertRow(VIDEO, b); await rememberTopics(b.topics); revalidatePath("/teachings/videos"); return json(r);
}
