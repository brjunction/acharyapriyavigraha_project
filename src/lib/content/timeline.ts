import { sql, hasDb } from "@/lib/db";
import { slugify } from "./text";
import { SEED_ERAS, SEED_EVENTS, type Era, type LifeEvent } from "./timeline-shared";
export * from "./timeline-shared";

export async function eventSlug(r: any, id?: string) { const b = slugify(`${r.year || ""} ${r.title || "event"}`); let s = b, n = 1; while ((await sql`select 1 from life_events where slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`; return s; }

const sortEv = (a: LifeEvent, b: LifeEvent) => a.year - b.year || (a.month || 0) - (b.month || 0) || (a.day || 0) - (b.day || 0) || a.position - b.position || a.importance - b.importance;

/** Everything the public timeline needs, in order. */
export async function getTimeline(): Promise<{ eras: Era[]; events: LifeEvent[]; recordings: Record<number, number> }> {
  if (!hasDb()) return { eras: SEED_ERAS, events: SEED_EVENTS, recordings: {} };
  try {
    const [eras, events, rec] = await Promise.all([
      sql`select id, title, subtitle, year_from, year_to, summary, image, position from life_eras order by year_from, position`,
      sql`select id, slug, year, month, day, year_to, circa, date_label, title, summary, body, kind, place, country, people, image, image_caption, links, source, importance, status, position from life_events where status = 'published'`,
      sql`select extract(year from date)::int as y, count(*)::int as n from audios where date is not null and status = 'published' group by 1`.catch(() => []),
    ]);
    const recordings = Object.fromEntries((rec as any[]).map((r) => [r.y, r.n]));
    return { eras: eras.length ? (eras as Era[]) : SEED_ERAS, events: events.length ? (events as LifeEvent[]).sort(sortEv) : SEED_EVENTS, recordings };
  } catch { return { eras: SEED_ERAS, events: SEED_EVENTS, recordings: {} }; }
}
