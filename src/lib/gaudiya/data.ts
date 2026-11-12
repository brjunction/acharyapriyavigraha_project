/* The Gauḍīya library (/gaudiya): the ācāryas (from the Guru-paramparā and the Biographies collections), their books, and the succession. */
import "server-only";
import { cache } from "react";
import { sql, hasDb } from "@/lib/db";
import { fold } from "@/lib/content/text";
import type { Item } from "@/lib/archive/config";

export type Acharya = Pick<Item, "id" | "collection" | "section" | "slug" | "title" | "subtitle" | "cover" | "summary" | "date_label" | "place" | "links"> & { position: number };
export type GBook = { id: string; kind: string; subject: string | null; slug: string; title: string; subtitle: string | null; author: string | null; acharya: string | null; category: string | null; cover_url: string | null; language: string; description: string | null; chapters: number; work: string | null; size: string | null; publisher: string | null; words: number };

const q = async <T,>(p: Promise<any>, d: T): Promise<T> => { if (!hasDb()) return d; try { return (await p) as T; } catch { return d; } };
export const SECTIONS: Record<string, string> = { origin: "From Śrī Kṛṣṇa", mahaprabhu: "Śrī Caitanya Mahāprabhu and the Gosvāmīs", acaryas: "The ācāryas", modern: "Śrīla Prabhupāda and Śrīla Gurudeva", "gaura-parsadas": "Associates of Śrī Caitanya Mahāprabhu", vaisnavas: "Other Vaiṣṇavas" };

export const getParampara = cache(() => q<Acharya[]>(sql`select id, collection, section, slug, title, subtitle, cover, summary, date_label, place, links, position from archive_items where collection = 'parampara' and status = 'published' order by position`, []));
export const getBiographies = cache(() => q<Acharya[]>(sql`select id, collection, section, slug, title, subtitle, cover, summary, date_label, place, links, position from archive_items where collection = 'biographies' and status = 'published' order by position, title`, []));
export const getAcharyas = cache(async () => { const [p, b] = await Promise.all([getParampara(), getBiographies()]); const seen = new Set(p.map((x) => x.slug)); return [...p, ...b.filter((x) => !seen.has(x.slug))]; });
export const getAcharya = cache(async (slug: string) => q<(Item & { position: number }) | null>(sql`select *, to_char(date, 'YYYY-MM-DD') as date from archive_items where collection in ('parampara', 'biographies') and slug = ${slug} and status = 'published' order by collection = 'biographies' desc limit 1`.then((r) => (r[0] as any) || null), null));
export const getGaudiyaBooks = cache(() => q<GBook[]>(sql`select b.id, b.kind, b.subject, b.slug, b.title, b.subtitle, b.author, b.acharya, b.category, b.cover_url, b.language, b.description, b.work, b.settings->>'size' as size, b.publisher,
  (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published' and n.parent_id is null) as chapters, (select coalesce(sum(length(n.search)), 0)::int / 6 from book_nodes n where n.book_id = b.id and n.status = 'published') as words
  from books b where b.status = 'published' and b.library = 'gaudiya' order by b.position, b.title`, []));

/** The words that name a person, without honorifics: "Śrīla Bhaktivinoda Ṭhākura" → "bhaktivinoda thakura". */
const core = (s: string) => fold(s).replace(/_/g, " ").replace(/\b(sri|srila|srimad|srimati|sripada|om visnupada|paramahamsa|his divine grace|a\.?\s?c\.?)\b/g, " ").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
/** Does this book belong to this ācārya? Set in the Studio (the ācārya's web address), or found from the author's name. */
export function bookOf(b: Pick<GBook, "acharya" | "author">, a: Pick<Acharya, "slug" | "title">) {
  if (b.acharya === a.slug) return true; const n = core(a.title); if (n.length < 4) return false;
  return [b.acharya, b.author].some((x) => { const c = x ? core(x) : ""; return c.length >= 4 && (c === n || c.includes(n) || n.includes(c)); });
}
export const booksOf = (books: GBook[], a: Acharya) => books.filter((b) => bookOf(b, a));

export type GCategory = { id: string; slug: string; name: string; description: string | null; parent: string | null; position: number };
export const getCategories = cache(() => q<GCategory[]>(sql`select c.id, c.slug, c.name, c.description, p.slug as parent, c.position from gaudiya_categories c left join gaudiya_categories p on p.id = c.parent_id order by c.parent_id nulls first, c.position, c.name`, []));
