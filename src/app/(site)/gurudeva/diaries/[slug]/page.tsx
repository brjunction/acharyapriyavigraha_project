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
    <Container className="max-w-[1000px] py-14">
      <p className="text-[13px] text-ink-3"><Link href="/gurudeva/diaries" className="hover:text-saffron">His Diary</Link></p>
      <h1 className="mt-2 font-[Gentium_Book_Plus,Georgia,serif] text-[30px] italic text-[#7a2a1c]">{when(e)}</h1>
      {(e.title || e.place) && <p className="mt-1 text-[13px] uppercase tracking-[0.14em] text-ink-3">{[e.title, e.place].filter(Boolean).join(" · ")}</p>}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {e.original && <div className="rounded-2xl bg-[#fbf2dc] p-7"><p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#a07a45]">His words</p><p lang={e.original_lang || undefined} className="whitespace-pre-line text-[18px] leading-[1.9] text-[#2a1606]">{e.original}</p></div>}
        {e.translation && <div className="rounded-2xl border border-[#ead7ae] p-7"><p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#a07a45]">Translation</p><p className="whitespace-pre-line text-[17px] leading-[1.85] text-ink">{e.translation}</p></div>}
      </div>
      {e.scan_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.scan_url} alt={`Handwritten page, ${when(e)}`} className="mx-auto mt-8 max-h-[80vh] rounded-xl shadow-lg" />}
      <p className="mt-10 text-center"><Link href={`/gurudeva/diaries?e=${e.slug}`} className="inline-flex h-11 items-center rounded-full bg-[#5a1d14] px-6 font-medium text-[#f6dca6]">Open this page in the diary</Link></p>
    </Container>
  );
}
