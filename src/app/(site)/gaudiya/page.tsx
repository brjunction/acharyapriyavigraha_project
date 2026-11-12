import Link from "next/link";
import { ArrowRight, Search, BookOpen, GitBranch, BookUser } from "lucide-react";
import { getAcharyas, getGaudiyaBooks, getParampara, booksOf } from "@/lib/gaudiya/data";
import { Portrait } from "@/components/gaudiya/portrait";

export const revalidate = 300;
export const metadata = { title: "Gauḍīya Library", description: "Books, biographies and the Guru-paramparā of the Gauḍīya Vaiṣṇava ācāryas, to read and search online." };

export default async function Page() {
  const [acharyas, books, chain] = await Promise.all([getAcharyas(), getGaudiyaBooks(), getParampara()]);
  const authors = acharyas.map((a) => ({ a, n: booksOf(books, a).length })).filter((x) => x.n > 0).sort((x, y) => y.n - x.n);
  const recent = books.slice(-8).reverse();
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-[#fdf6ea] to-white">
        <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">Gauḍīya Library</p>
          <h1 className="mt-2 max-w-2xl text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[40px]">The teachings of our ācāryas, in one place</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">Their books, their lives and the line of the Guru-paramparā — to read, study and search, in Hindi, Odia, Bengali, English and more.</p>
          <form action="/gaudiya/books" className="mt-7 flex max-w-xl items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-4 shadow-[0_10px_30px_-18px_rgba(138,75,15,0.5)]">
            <Search size={17} className="shrink-0 text-ink-3" /><input name="q" placeholder="Search a book or an ācārya" className="h-9 min-w-0 flex-1 bg-transparent text-[14.5px] outline-none" />
            <button className="h-9 shrink-0 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-ink/90">Search</button>
          </form>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
            {([["/gaudiya/books", BookOpen, `${books.length} books`, "Read online"], ["/gaudiya/biographies", BookUser, `${acharyas.length} lives`, "Biographies"], ["/gaudiya/parampara", GitBranch, `${chain.length} ācāryas`, "Guru-paramparā"]] as const).map(([h, I, a, b]) => (
              <Link key={h} href={h} className="group rounded-xl border border-line bg-white/80 p-3 transition hover:-translate-y-0.5 hover:border-saffron/40 hover:shadow-md sm:p-4"><I size={18} className="text-saffron" /><p className="mt-2 text-[15px] font-semibold text-ink">{a}</p><p className="flex items-center gap-1 text-[12.5px] text-ink-3">{b}<ArrowRight size={12} className="transition group-hover:translate-x-0.5" /></p></Link>))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-[19px] font-semibold text-ink">Ācāryas and their books</h2><Link href="/gaudiya/acharyas" className="text-[13px] text-ink-2 hover:text-saffron">All ācāryas</Link></div>
          {authors.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{authors.map(({ a, n }) => (
            <Link key={a.slug} href={`/gaudiya/acharyas/${a.slug}`} className="group flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-saffron/40 hover:bg-[#fffaf2]"><Portrait src={a.cover} name={a.title} size={48} /><span className="min-w-0"><span className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:text-saffron">{a.title}</span><span className="text-[12px] text-ink-3">{n} {n === 1 ? "book" : "books"}</span></span></Link>))}</div>
            : <p className="rounded-xl border border-dashed border-line p-8 text-center text-[13.5px] text-ink-3">The books of the ācāryas are being added.</p>}
        </section>

        {recent.length > 0 && <section className="mt-14">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-[19px] font-semibold text-ink">Recently added</h2><Link href="/gaudiya/books" className="text-[13px] text-ink-2 hover:text-saffron">All books</Link></div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-8">{recent.map((b) => (
            <Link key={b.slug} href={`/books/${b.slug}`} className="group"><span className="relative block aspect-[3/4] overflow-hidden rounded-[3px_8px_8px_3px] bg-gradient-to-br from-[#5a3418] to-[#2d1a0c] shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">{b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center p-2 text-center text-[11.5px] leading-snug text-white/90">{b.title}</span>}</span><span className="mt-2 line-clamp-2 block text-[12.5px] leading-snug text-ink">{b.title}</span></Link>))}</div>
        </section>}

        <section className="mt-14 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#fdf3e3] to-[#fffaf3]">
          <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
            <div><p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-saffron">Guru-paramparā</p><h2 className="mt-1 text-[22px] font-semibold text-ink">From Śrī Kṛṣṇa to Śrīla Gurudeva</h2><p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink-2">The disciplic succession, ācārya by ācārya. Open any name to read his life and his books.</p>
              <Link href="/gaudiya/parampara" className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium text-white hover:bg-ink/90">See the paramparā<ArrowRight size={15} /></Link></div>
            <div className="flex -space-x-3">{chain.slice(-6).map((a) => <Portrait key={a.slug} src={a.cover} name={a.title} size={54} ring />)}</div>
          </div>
        </section>
      </div>
    </div>);
}
