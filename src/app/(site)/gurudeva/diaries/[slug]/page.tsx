import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DiaryReader } from "@/components/diary/diary-reader";
import { diaryIndex, diaryPage } from "@/lib/content/diary-public";

export const revalidate = 300;
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (e: { date: string | null; date_note: string | null }) => (e.date ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(e.date.split("-").map(Number)) : e.date_note || "");
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const e = await diaryPage(slug); return e ? { title: `His Diary, ${when(e)}`, description: String(e.translation || "").slice(0, 155), alternates: { canonical: `/gurudeva/diaries/${slug}` } } : {}; }

/** One diary page, rendered on the server (for sharing and search engines) inside the reader. */
export default async function Entry({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [e, list] = await Promise.all([diaryPage(slug), diaryIndex()]); if (!e) notFound();
  return <DiaryReader entries={list} start={slug} initialText={e.translation} />;
}
