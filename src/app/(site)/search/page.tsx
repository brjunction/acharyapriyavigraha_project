import Link from "next/link";
import { Play, Search } from "lucide-react";
import { LECTURES, TATTVA, QUOTE_OF_DAY, fmtDate } from "@/lib/data";
import { Container, QuoteCard } from "@/components/ui";
import { LectureRow } from "@/components/lecture";
import { norm } from "@/components/search";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const words = norm(q).split(/\s+/).filter(Boolean);
  const hit = (s: string) => words.some((w) => norm(s).includes(w));
  const lectures = words.length ? LECTURES.filter((l) => hit(`${l.title} ${l.place} ${l.scripture} ${l.topics.join(" ")} ${l.date}`)) : [];
  const topics = TATTVA.flatMap((t) => t.children.map((c) => ({ c, t }))).filter(({ c, t }) => hit(c) || hit(t.name));
  const groups: [string, number][] = [["Best matches", lectures.length + topics.length + 3], ["Transcript passages", 37], ["Quotes", 12], ["Lectures", lectures.length], ["Topics", topics.length], ["Books", 3], ["Letters", 1]];
  return (
    <div className="bg-band/50">
      <Container className="py-12">
        <form className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-line bg-surface p-2 pl-4 shadow-[var(--shadow-md)] focus-within:border-saffron">
          <Search size={20} className="text-saffron" />
          <input name="q" defaultValue={q} placeholder="Search everything" className="h-12 flex-1 bg-transparent text-[15.5px] outline-none" />
          <button className="btn btn-primary !h-11 !px-6">Search</button>
        </form>
        <p className="mt-3 text-center text-[13px] text-ink-3">Results for <span className="font-medium text-ink">“{q}”</span>, including spelling variants. Sample results in the prototype.</p>
        <div className="scrollbar-none mx-auto mt-6 flex max-w-5xl justify-center gap-2 overflow-x-auto">
          {groups.map(([n, c], i) => <span key={n} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] ${i === 0 ? "border-saffron bg-saffron text-white" : "border-line bg-surface text-ink-2"}`}>{n} <span className="tabular opacity-70">{c}</span></span>)}
        </div>
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <section>
              <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Transcript passages</p>
              {LECTURES.filter((l) => l.transcribed).slice(0, 3).map((l, i) => (
                <div key={l.slug} className="card mb-3 p-6">
                  <p className="font-serif text-[16.5px] leading-relaxed text-ink-2">… a sample passage in which <mark className="rounded bg-saffron-soft px-1 text-ink">{q || "your words"}</mark> appears, shown with the sentences around it …</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[12.5px] text-ink-3">
                    <button className="flex items-center gap-1.5 rounded-full bg-saffron px-3 py-1 font-medium text-white"><Play size={12} fill="currentColor" />Play from {12 + i * 7}:{20 + i * 9}</button>
                    <Link href={`/teachings/audio/${l.slug}`} className="hover:text-saffron"><span className="font-medium text-ink">{l.title}</span>, {fmtDate(l.date)}, {l.place}</Link>
                  </div>
                </div>
              ))}
            </section>
            {lectures.length > 0 && <section><p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Lectures</p><div className="card px-2">{lectures.slice(0, 8).map((l) => <LectureRow key={l.slug} l={l} />)}</div></section>}
          </div>
          <aside className="space-y-5">
            {topics.length > 0 && <div className="card p-5"><p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Topics</p><div className="mt-3 flex flex-wrap gap-1.5">{topics.slice(0, 8).map(({ c, t }) => <Link key={c} href={`/tattva/${t.slug}`} className="rounded-full bg-saffron-soft px-3 py-1 text-[12.5px] text-saffron">{c}</Link>)}</div></div>}
            <QuoteCard text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} />
          </aside>
        </div>
      </Container>
    </div>
  );
}
