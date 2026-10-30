import { sql, hasDb } from "@/lib/db";
import type { Entry } from "@/components/diary/diary-reader";

/** The index of published diary pages (dates only; texts load page by page). */
export async function diaryIndex(): Promise<Entry[]> {
  if (!hasDb()) return [];
  try { return (await sql`select slug, to_char(date, 'YYYY-MM-DD') as date, date_note, volume, page from diary_entries where status = 'published' and coalesce(translation, '') <> '' order by date nulls last, position, created_at`) as Entry[]; } catch { return []; }
}
export async function diaryPage(slug: string): Promise<{ slug: string; date: string | null; date_note: string | null; translation: string | null } | null> {
  if (!hasDb()) return null;
  try { return ((await sql`select slug, to_char(date, 'YYYY-MM-DD') as date, date_note, translation from diary_entries where slug = ${slug} and status = 'published'`)[0] as any) || null; } catch { return null; }
}
