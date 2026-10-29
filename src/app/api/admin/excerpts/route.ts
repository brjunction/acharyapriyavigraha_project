import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { EXCERPT, insertRow, rememberTopics } from "@/lib/content/generic";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const p = (k: string) => u.get(k) || null; const page = Math.max(1, Number(p("page")) || 1);
  const q = p("q") ? `%${fold(p("q"))}%` : null;
  const rows = await sql`select e.id, e.slug, e.kind, e.title, e.text, e.source, e.verse_ref, e.author, e.date, e.topics, e.status, e.audio_id, e.at_sec, a.title as lecture, count(*) over() as total
    from excerpts e left join audios a on a.id = e.audio_id
    where (${p("kind")}::text is null or e.kind = ${p("kind")}) and (${q}::text is null or e.search like ${q}) and (${p("topic")}::text is null or ${p("topic")} = any(e.topics)) and (${p("status")}::text is null or e.status = ${p("status")})
    order by e.position, e.created_at desc limit 60 offset ${(page - 1) * 60}`;
  const kinds = await sql`select kind, count(*)::int as n from excerpts group by 1`;
  return json({ rows: rows.map(({ total, ...r }) => r), total: Number(rows[0]?.total || 0), kinds });
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!b.kind) return fail("Missing kind."); if (!String(b.text || b.original || b.title || "").trim()) return fail("Write the text first.");
  if (g.user.role === "contributor") b.status = "draft";
  const r = await insertRow(EXCERPT, b); await rememberTopics(b.topics); revalidatePath("/teachings/quotes"); return json(r);
}
