import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select * from announcements order by created_at desc`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); if (!String(b.title || "").trim()) return fail("Give the announcement a title.");
  const r = await sql`insert into announcements (title, body, kind, cta_label, cta_url, starts_at, ends_at, active) values (${b.title}, ${b.body || ""}, ${b.kind || "notice"}, ${b.cta_label || null}, ${b.cta_url || null}, ${b.starts_at || null}, ${b.ends_at || null}, ${b.active !== false}) returning id`;
  return json(r[0]);
}
