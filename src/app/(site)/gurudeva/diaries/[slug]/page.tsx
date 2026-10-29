import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql, hasDb } from "@/lib/db";
import { Container } from "@/components/ui";

export const revalidate = 300;
async function get(slug: string) { if (!hasDb()) return null; try { return ((await sql`select * from diary_entries where slug = ${slug} and status = 'published'`)[0] as any) || null; } catch { return null; } }
const when = (e: any) => (e.date ? new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : e.date_note || "");
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const e = await get(slug); return e ? { title: `His Diary, ${when(e)}`, description: String(e.translation || e.original || "").slice(0, 155) } : {}; }
/** One diary page as plain text, for reading, sharing and search engines. */
export default async function Entry({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const e = await get(slug); if (!e) notFound();
  return (
    <Container className="max-w-[760px] py-10 sm:py-14">
      <p className="text-[12.5px] text-ink-3"><Link href="/gurudeva/diaries" className="hover:text-saffron">His Diary</Link></p>
      <h1 className="mt-2 font-[Gentium_Book_Plus,Georgia,serif] text-[22px] italic sm:text-[25px] text-[#7a2a1c]">{when(e)}</h1>
      <div className="mt-6 rounded-2xl border border-[#ead7ae] bg-[#fffcf5] p-6 sm:p-8"><p className="whitespace-pre-line text-[15px] leading-[1.85] text-ink">{e.translation}</p></div>
      <p className="mt-10 text-center"><Link href={`/gurudeva/diaries?e=${e.slug}`} className="inline-flex h-10 items-center rounded-full bg-[#5a1d14] px-5 text-[13.5px] font-medium text-[#f6dca6]">Open this page in the diary</Link></p>
    </Container>
  );
}
