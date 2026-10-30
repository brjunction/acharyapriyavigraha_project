import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { cleanEvent, eventSearch, eventSlug } from "@/lib/content/timeline";

/** Eras and every event (hidden ones too), for the Studio. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const [eras, events] = await Promise.all([
    sql`select * from life_eras order by year_from, position`,
    sql`select id, slug, year, month, day, year_to, circa, date_label, title, summary, kind, place, country, people, image, importance, status, position, (body is not null and body <> '') as has_body from life_events order by year, month nulls first, day nulls first, position`,
  ]);
  return json({ eras, events });
}
/** One event, or { import: [...] } for many at once. */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.import)) {
    let added = 0; const bad: string[] = [];
    for (const x of b.import.slice(0, 1000)) { if (!x.title || !Number(x.year)) { bad.push(x.title || `row ${added + bad.length + 1}`); continue; } await insert(x); added++; }
    revalidatePath("/gurudeva/timeline"); return json({ added, skipped: bad });
  }
  if (!String(b.title || "").trim()) return fail("Give this moment a title."); if (!Number(b.year)) return fail("Give at least the year.");
  const r = await insert(b); revalidatePath("/gurudeva/timeline"); return json(r);
}
async function insert(b: any) {
  const o = cleanEvent(b); const cols = Object.keys(o);
  return (await sql.query(`insert into life_events (slug, search, ${cols.join(", ")}) values ($1, $2, ${cols.map((k, i) => k === "links" ? `$${i + 3}::jsonb` : `$${i + 3}`).join(", ")}) returning id, slug`, [await eventSlug(o), eventSearch(o), ...cols.map((k) => o[k])]))[0];
}
