import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, GitBranch, MapPin } from "lucide-react";
import { getAcharya, getGaudiyaBooks, getParampara, booksOf, SECTIONS } from "@/lib/gaudiya/data";
import { Render } from "@/components/cms/doc";
import { Portrait } from "@/components/gaudiya/portrait";
import { Cover } from "@/components/gaudiya/cover";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const a = await getAcharya(slug); return a ? { title: `${a.title} · Gauḍīya Library`, description: a.summary || `${a.title}: his books and biography.` } : {}; }

/** One ācārya: who he is, his books, his life, and his place in the paramparā. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [a, all, chain] = await Promise.all([getAcharya(slug), getGaudiyaBooks(), getParampara()]); if (!a) notFound();
  const books = booksOf(all, a as any); const k = chain.findIndex((x) => x.slug === a.slug); const guru = k > 0 ? chain[k - 1] : null, disciple = k >= 0 && k < chain.length - 1 ? chain[k + 1] : null;
  const body = Array.isArray(a.body) ? a.body : [];
  return (
    <div className="bg-white">
      <section className="border-b border-line bg-gradient-to-b from-[#fdf6ea] to-white">
        <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-8 sm:px-6">
          <span className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]"><Link href="/gaudiya" className="inline-flex items-center gap-1.5 text-ink-3 hover:text-ink"><ArrowLeft size={14} />Gauḍīya library</Link><Link href="/gaudiya/biographies" className="text-ink-3 hover:text-ink">Biographies</Link></span>
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Portrait src={a.cover} name={a.title} size={112} ring />
            <div className="min-w-0">
              {a.section && <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">{k >= 0 ? "Guru-paramparā" : SECTIONS[a.section] || "Biography"}</p>}
              <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[34px]">{a.title}</h1>
              {a.subtitle && <p className="mt-1 text-[15px] text-ink-2">{a.subtitle}</p>}
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-3">{a.place && <span className="flex items-center gap-1"><MapPin size={13} />{a.place}</span>}{books.length > 0 && <a href="#books" className="flex items-center gap-1 hover:text-saffron"><BookOpen size={13} />{books.length} {books.length === 1 ? "book" : "books"}</a>}{k >= 0 && <Link href={`/gaudiya/parampara#${a.slug}`} className="flex items-center gap-1 hover:text-saffron"><GitBranch size={13} />In the paramparā</Link>}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
        {books.length > 0 && <section id="books" className="scroll-mt-28 pt-10">
          <h2 className="mb-4 text-[18px] font-semibold text-ink">Books</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">{books.map((b) => (
            <Link key={b.slug} href={`/books/${b.slug}`} className="group"><Cover src={b.cover_url} title={b.title} />
              <span className="mt-2 line-clamp-2 block text-[13px] font-medium leading-snug text-ink group-hover:text-saffron">{b.title}</span><span className="text-[11.5px] uppercase tracking-wide text-ink-3">{b.language}</span></Link>))}</div>
        </section>}

        <section className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <h2 className="mb-3 text-[18px] font-semibold text-ink">Life</h2>
            {a.summary && <p className="mb-5 text-[16px] leading-relaxed text-ink-2">{a.summary}</p>}
            {body.length ? <div className="book-body text-[16px] leading-[1.8]"><Render doc={body} /></div> : <p className="rounded-xl border border-dashed border-line p-6 text-[13.5px] text-ink-3">His full biography is being prepared.</p>}
          </article>
          {k >= 0 && <aside className="lg:pt-10"><div className="rounded-xl border border-line p-4 lg:sticky lg:top-32">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">In the Guru-paramparā</p>
            {guru && <Link href={`/gaudiya/acharyas/${guru.slug}`} className="mt-3 flex items-center gap-3 rounded-lg p-2 hover:bg-band"><Portrait src={guru.cover} name={guru.title} size={36} /><span className="min-w-0"><span className="block text-[11.5px] text-ink-3">Before him</span><span className="block truncate text-[13px] font-medium text-ink">{guru.title}</span></span></Link>}
            {disciple && <Link href={`/gaudiya/acharyas/${disciple.slug}`} className="mt-1 flex items-center gap-3 rounded-lg p-2 hover:bg-band"><Portrait src={disciple.cover} name={disciple.title} size={36} /><span className="min-w-0"><span className="block text-[11.5px] text-ink-3">After him</span><span className="block truncate text-[13px] font-medium text-ink">{disciple.title}</span></span></Link>}
            <Link href={`/gaudiya/parampara#${a.slug}`} className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[12.5px] text-ink-2 hover:border-saffron/40 hover:text-saffron">See the whole paramparā<ArrowRight size={13} /></Link>
          </div></aside>}
        </section>
      </div>
    </div>);
}
