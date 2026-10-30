import { sql, hasDb } from "@/lib/db";
import { fold, slugify } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";
import { COLLECTIONS, type Item, type Section } from "./config";

export const ITEM_COLS = ["section", "title", "subtitle", "person", "person_role", "recipient", "date", "year", "date_label", "place", "region", "country", "cover", "images", "summary", "body", "chapters", "links", "media", "tags", "related", "status_label", "featured", "position", "status"] as const;
const JSONB = new Set(["images", "body", "chapters", "links"]);
export const isJsonb = (k: string) => JSONB.has(k);

export function cleanItem(b: any) {
  const o: Record<string, any> = {};
  for (const k of ITEM_COLS) if (k in b) {
    let v = b[k]; if (v === "") v = null;
    if (k === "year" || k === "position") v = v === null || v === undefined ? (k === "position" ? 0 : null) : Number(v) || (k === "position" ? 0 : null);
    if (k === "featured") v = !!v;
    if (k === "tags") v = Array.isArray(v) ? v.map(String).map((x) => x.trim()).filter(Boolean) : String(v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    if (k === "related") v = Array.isArray(v) ? v.filter((x: string) => /^[0-9a-f-]{36}$/.test(x)) : [];
    if (JSONB.has(k)) v = JSON.stringify(Array.isArray(v) ? v : []);
    if (k === "date" && v && !/^\d{4}-\d{2}-\d{2}/.test(String(v))) v = null;
    o[k] = v;
  }
  if (o.date && !o.year) o.year = Number(String(o.date).slice(0, 4));
  return o;
}
export const itemSearch = (r: any) => fold([r.title, r.subtitle, r.person, r.person_role, r.recipient, r.place, r.region, r.country, r.year, r.date_label, r.summary, ...(r.tags || []), docText(typeof r.body === "string" ? JSON.parse(r.body) : r.body || [])].filter(Boolean).join(" ")).slice(0, 20000);
export async function itemSlug(collection: string, r: any, id?: string) { const b = slugify(r.title || "item"); let s = b, n = 1; while ((await sql`select 1 from archive_items where collection = ${collection} and slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`; return s; }

/** The sections of a collection; the defaults are written the first time. */
export async function sectionsOf(collection: string): Promise<Section[]> {
  const c = COLLECTIONS[collection]; const def = c.sections.map(([key, title, description], position) => ({ key, title, description, position }));
  if (!hasDb()) return def;
  try {
    let rows = (await sql`select key, title, description, position from archive_sections where collection = ${collection} order by position, title`) as Section[];
    if (!rows.length) { for (const s of def) await sql`insert into archive_sections (collection, key, title, description, position) values (${collection}, ${s.key}, ${s.title}, ${s.description || null}, ${s.position}) on conflict do nothing`; rows = def; }
    return rows;
  } catch { return def; }
}

const ORDER: Record<string, string> = { date: "coalesce(date, make_date(year, 1, 1)) desc nulls last, position, title", position: "position, title", title: "title" };
/** Published items of a collection (light: no body), optionally one section and a search. */
export async function listItems(collection: string, o: { section?: string | null; q?: string | null; limit?: number } = {}): Promise<Item[]> {
  if (!hasDb()) return [];
  const c = COLLECTIONS[collection];
  try {
    return (await sql.query(`select id, collection, section, slug, title, subtitle, person, person_role, recipient, to_char(date, 'YYYY-MM-DD') as date, year, date_label, place, region, country, cover, images, summary, '[]'::jsonb as body, '[]'::jsonb as chapters, links, media, tags, related, status_label, featured, position, status
      from archive_items where collection = $1 and status = 'published' and ($2::text is null or section = $2) and ($3::text is null or search like $3) order by featured desc, ${ORDER[c.sort]} limit $4`,
      [collection, o.section || null, o.q ? `%${fold(o.q)}%` : null, o.limit || 2000])) as Item[];
  } catch { return []; }
}
export async function getItem(collection: string, slug: string): Promise<Item | null> {
  if (!hasDb()) return null;
  try { return ((await sql`select *, to_char(date, 'YYYY-MM-DD') as date from archive_items where collection = ${collection} and slug = ${slug} and status = 'published'`)[0] as Item) || null; } catch { return null; }
}
export async function itemsByIds(ids: string[]): Promise<Item[]> {
  if (!hasDb() || !ids?.length) return [];
  try { return (await sql`select id, collection, section, slug, title, subtitle, person, person_role, cover, images, summary, year, date_label, to_char(date, 'YYYY-MM-DD') as date from archive_items where id = any(${ids}) and status = 'published'`) as Item[]; } catch { return []; }
}
