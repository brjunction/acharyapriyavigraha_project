import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

const COLS = ["date", "title", "kind", "fasting", "paran", "description", "location", "link", "status"];
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const year = Number(u.get("year")) || new Date().getFullYear(); const loc = u.get("location") || null;
  const rows = await sql`select * from calendar_events where extract(year from date) = ${year} and (${loc}::text is null or location = ${loc}) order by date, title`;
  const locations = await sql`select location, count(*)::int as n from calendar_events group by 1 order by 1`;
  const years = await sql`select extract(year from date)::int as y, count(*)::int as n from calendar_events group by 1 order by 1`;
  return json({ rows, locations, years });
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (!b.date || !String(b.title || "").trim()) return fail("A date and a name are needed.");
  const r = await sql`insert into calendar_events (date, title, kind, fasting, paran, description, location, link) values (${b.date}, ${b.title}, ${b.kind || "festival"}, ${b.fasting || null}, ${b.paran || null}, ${b.description || null}, ${b.location || "Bhubaneswar"}, ${b.link || null}) returning id`;
  revalidatePath("/resources/vaishnava-calendar"); return json(r[0]);
}

