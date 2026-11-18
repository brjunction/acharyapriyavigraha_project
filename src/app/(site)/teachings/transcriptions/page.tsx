import { cmsOverride } from "@/lib/cms/render";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/ui";
import { TranscriptionBrowser, type TItem } from "./browser";
import { sql, hasDb } from "@/lib/db";
import { verseRef } from "@/lib/content/text";

export const metadata = { title: "Transcriptions" };
export const revalidate = 600;
const TYPE: Record<string, string> = { lecture: "Lecture", darshan: "Darśana", qa: "Questions & Answers", festival: "Festival", interview: "Interview", conversation: "Conversation" };

export default async function Page() {
  const cms = await cmsOverride('/teachings/transcriptions'); if (cms) return cms;
  const rows: any[] = hasDb() ? ((await sql`select slug, code, title, to_char(date, 'YYYY-MM-DD') date, place, country, kind, type, scripture, canto, chapter, verse, topics, language from audios where status = 'published' and kind not in ('kirtan','bhajan') and jsonb_array_length(coalesce(transcript, '[]'::jsonb)) > 0 order by date desc nulls last`.catch(() => [])) as any[]) : [];
  const items: TItem[] = rows.map((r) => ({ slug: r.slug, href: r.code ? `/audios/${r.code}` : `/teachings/audio/${r.slug}`, title: r.title, date: r.date || "", place: [r.place, r.country].filter(Boolean).join(", "), type: r.scripture ? "Lecture" : TYPE[r.type] || TYPE[r.kind] || r.type || "Lecture", scripture: verseRef(r) || undefined, topics: r.topics || [], languages: [r.language || "en"] }));
  return <Original items={items} />;
}

function Original({ items }: { items: TItem[] }) {
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Transcriptions" }]} icon={FileText} title="Transcriptions"
        intro={`${items.length ? `${items.length.toLocaleString()} ${items.length === 1 ? "lecture is" : "lectures are"} available as text so far.` : "Lectures will appear here as their transcriptions are published."} Choose a year and month, or narrow by type, topic, place and language.`} bg="cream-mandala" flip />
      <TranscriptionBrowser items={items} />
    </>
  );
}
