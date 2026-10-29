import { cmsOverride } from "@/lib/cms/render";

import { DiaryBook, type Entry } from "@/components/diary/diary-book";
import { sql, hasDb } from "@/lib/db";

export const metadata = { title: "His Diary — prayers to Śrī Gopāl Jiu", description: "The diary Śrī Śrīmad Gour Govinda Swāmī Gurudeva wrote throughout his life as prayers to his beloved Deity, Śrī Gopāl Jiu." };
export const dynamic = "force-dynamic";

async function entries(): Promise<Entry[]> {
  if (!hasDb()) return [];
  try { return (await sql`select slug, to_char(date, 'YYYY-MM-DD') as date, date_note, place, title, original, original_lang, translation, scan_url, volume, page from diary_entries where status = 'published' and coalesce(translation, '') <> '' order by date nulls last, position, created_at`) as Entry[]; } catch { return []; }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const cms = await cmsOverride('/gurudeva/diaries'); if (cms) return cms;
  const list = await entries(); const { e } = await searchParams;
  return <DiaryBook entries={list} start={Math.max(0, list.findIndex((x) => x.slug === e))} />;
}
