import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

const COL: Record<string, string> = { place: "place", series: "series", occasion: "occasion", singer: "singer", country: "country", language: "language", atype: "type", stype: "type" };
/** Shared lists: places, series, topics, occasions, singers, countries. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const kind = new URL(req.url).searchParams.get("kind");
  return json(await sql`select v.id, v.kind, v.name, v.extra,
    (case when v.kind = 'topic' then (select count(*) from audios a where v.name = any(a.topics)) + (select count(*) from videos x where v.name = any(x.topics)) + (select count(*) from excerpts e where v.name = any(e.topics))
     when v.kind = 'place' then (select count(*) from audios a where a.place = v.name) + (select count(*) from videos x where x.place = v.name)
     when v.kind = 'series' then (select count(*) from audios a where a.series = v.name) + (select count(*) from videos x where x.series = v.name)
     when v.kind = 'language' then (select count(*) from audios a where a.language = v.name)
     when v.kind = 'atype' then (select count(*) from audios a where a.type = v.name and a.kind not in ('kirtan','bhajan'))
     when v.kind = 'stype' then (select count(*) from audios a where a.type = v.name and a.kind in ('kirtan','bhajan'))
     else 0 end)::int as used
    from vocab v where (${kind}::text is null or v.kind = ${kind}) order by v.name`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!b.kind || !String(b.name || "").trim()) return fail("Missing name.");
  await sql`insert into vocab (kind, name, extra) values (${b.kind}, ${String(b.name).trim()}, ${JSON.stringify(b.extra || {})}::jsonb) on conflict (kind, name) do update set extra = excluded.extra`; return json({ ok: true });
}
/** Rename (everywhere it is used) or merge into another name. */
export async function PATCH(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); const from = String(b.from || ""), to = String(b.to || "").trim(); if (!b.kind || !from || !to) return fail("Missing names.");
  if (b.kind === "topic") { for (const t of ["audios", "videos", "excerpts", "articles"]) await sql.query(`update ${t} set topics = array_replace(topics, $1, $2) where $1 = any(topics)`, [from, to]); }
  else if (COL[b.kind]) { await sql.query(`update audios set ${COL[b.kind]} = $2 where ${COL[b.kind]} = $1`, [from, to]); if (b.kind === "place" || b.kind === "series") await sql.query(`update videos set ${COL[b.kind]} = $2 where ${COL[b.kind]} = $1`, [from, to]); }
  await sql`delete from vocab where kind = ${b.kind} and name = ${from}`;
  await sql`insert into vocab (kind, name) values (${b.kind}, ${to}) on conflict do nothing`; return json({ ok: true });
}
export async function DELETE(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); await sql`delete from vocab where kind = ${b.kind} and name = ${b.name}`; return json({ ok: true });
}
