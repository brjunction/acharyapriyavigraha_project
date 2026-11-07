import { sql, hasDb } from "@/lib/db";
import { verseRef } from "@/lib/content/text";
import { AudioChart, type ChartRow } from "@/components/media/audio-chart";

export const revalidate = 300;
export const metadata = { title: "All Audios — Systematic Chart", description: "Every recording of Śrī Śrīmad Gour Govinda Swāmī Gurudeva on one page, year by year: date, place, verse, type, length and file name." };

export default async function Page() {
  let rows: ChartRow[] = [];
  if (hasDb()) {
    try {
      const r = (await sql`select slug, code, file_title, title, kind, type, to_char(date, 'YYYY-MM-DD') as date, date_note, place, country, scripture, canto, chapter, verse, language, series, duration_sec, transcript_status from audios where status = 'published' order by date asc nulls last, title`) as any[];
      rows = r.map((a) => ({ slug: a.slug, code: a.code, file: a.file_title, title: a.title, kind: a.kind, type: a.type, date: a.date, dateNote: a.date_note, place: a.place, country: a.country, verse: verseRef(a) || null, language: a.language, series: a.series, seconds: a.duration_sec || 0, transcribed: a.transcript_status === "done" }));
    } catch {}
  }
  return <AudioChart rows={rows} />;
}
