import Link from "next/link";
import { BookOpen, NotebookPen, MapPin, ArrowRight } from "lucide-react";
import { cmsOverride } from "@/lib/cms/render";
import { sql, hasDb } from "@/lib/db";

export const metadata = { title: "His beloved Deity — Śrī Gopāl Jiu", description: "Śrī Gopāl Jiu of Gaḍeigiri, the beloved Deity of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, and the book that tells His story." };
export const revalidate = 300;

/** His beloved Deity: who Śrī Gopāl Jiu is, the book about Him, His home in Gaḍeigiri, and the diary written to Him. */
export default async function Page() {
  const cms = await cmsOverride("/gurudeva/radha-gopal-jiu"); if (cms) return cms;
  let books: { slug: string; title: string; cover_url: string | null; language: string }[] = [];
  if (hasDb()) { try { books = (await sql`select slug, title, cover_url, language from books where status = 'published' and (title ilike '%gopal jiu%' or title ilike '%gopāl jiu%') order by language = 'en' desc, title`) as any[]; } catch {} }
  const book = books[0];
  return (
    <div className="bg-white">
      <section className="border-b border-[#efe4cf] bg-[#fbf7ef]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-[11.5px] font-medium uppercase tracking-[0.3em] text-saffron">His beloved Deity</p>
            <h1 className="text-[30px] leading-[1.15] text-ink sm:text-[40px]">Śrī Gopāl Jiu of Gaḍeigiri</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">Gopāl came from Vṛndāvana to the village of Gaḍeigiri in Odisha, where the Giri family — Śrīla Gurudeva’s mother’s family — served Him for generations with kīrtana and Bhāgavatam. From childhood Śrīla Gurudeva lived for Gopāl, and throughout his life he wrote to Him in his diary.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {book && <Link href={`/books/${book.slug}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink/90"><BookOpen size={15} />Read the book “Gopāl Jiu”</Link>}
              <Link href="/gurudeva/diaries" className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong bg-white px-4 text-[13.5px] text-ink hover:bg-band"><NotebookPen size={15} />His prayers to Gopāl</Link>
            </div>
          </div>
          {book && <Link href={`/books/${book.slug}`} className="group mx-auto w-[220px]"><span className="relative block aspect-[3/4] overflow-hidden rounded-[3px_8px_8px_3px] bg-gradient-to-br from-[#7a3a10] to-[#3f1a05] shadow-[0_30px_60px_-25px_rgba(60,20,0,0.6)] transition group-hover:-translate-y-1">{book.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center p-4 text-center text-[18px] text-[#f3d9a4]">{book.title}</span>}<span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" /></span><span className="mt-3 block text-center text-[13px] text-ink-2">{book.title}</span></Link>}
        </div>
      </section>
      <div className="mx-auto grid max-w-[1240px] gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {[
          [BookOpen, "The book", book ? `${books.length > 1 ? `${books.length} languages · ` : ""}Read it chapter by chapter, from the founding of Gaḍeigiri to the temple for Gopāl.` : "The book about Gopāl Jiu will be here.", book ? `/books/${book.slug}` : "/teachings/books"],
          [MapPin, "Gaḍeigiri, Odisha", "The village where Gopāl is served — Śrī Śrī Rādhā-Gopāl Jiu Mandira, Gaḍeigiri.", "https://www.google.com/maps/search/?api=1&query=Gadeigiri%20Gopal%20Jiu%20Temple%20Odisha"],
          [NotebookPen, "His diary", "Prayers Śrīla Gurudeva wrote to Gopāl, day after day — read them by year and month.", "/gurudeva/diaries"],
        ].map(([I, t, d, h]: any) => <Link key={t} href={h} target={String(h).startsWith("http") ? "_blank" : undefined} className="group rounded-2xl border border-line p-5 transition hover:border-line-strong"><span className="mb-3 flex size-10 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-saffron"><I size={17} /></span><span className="block text-[15px] font-medium text-ink group-hover:underline">{t}</span><span className="mt-1 block text-[13px] leading-snug text-ink-2">{d}</span><ArrowRight size={14} className="mt-3 text-ink-3" /></Link>)}
      </div>
    </div>
  );
}
