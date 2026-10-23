import Link from "next/link";
import { Play } from "lucide-react";
import { LECTURES, TATTVA, QUOTE_OF_DAY, fmtDate } from "@/lib/data";
import { QuoteCard } from "@/components/ui";
import { LectureRow } from "@/components/lecture";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const words = norm(q).split(/\s+/).filter(Boolean);
  const hit = (s: string) => words.some((w) => norm(s).includes(w));
  const lectures = words.length ? LECTURES.filter((l) => hit(`${l.title} ${l.place} ${l.scripture} ${l.topics.join(" ")} ${l.date}`)) : [];
  const topics = TATTVA.flatMap((t) => t.children.map((c) => ({ c, t }))).filter(({ c, t }) => hit(c) || hit(t.name));
  const groups = [["Best matches", lectures.length + topics.length + 3], ["Transcript passages", 37], ["Quotes", 12], ["Lectures", lectures.length], ["Topics", topics.length], ["Books", 3], ["Letters", 1]];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <form className="flex max-w-3xl items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm">
        <input name="q" defaultValue={q} placeholder="Search everything…" className="h-12 flex-1 bg-transparent px-3 text-lg outline-none" />
        <button className="rounded-xl bg-saffron px-5 py-3 text-sm font-medium text-white">Search</button>
      </form>
      <p className="mt-3 text-sm text-ink-3">Results for <span className="font-medium text-ink">“{q}”</span> · diacritics and spelling variants included (prototype sample results)</p>
      <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto">
        {groups.map(([n, c], i) => <span key={n} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm ${i === 0 ? "border-maroon bg-maroon text-paper" : "border-line bg-card text-ink-2"}`}>{n} <span className="opacity-60">{c}</span></span>)}
      </div>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">Transcript passages</p>
            {LECTURES.filter((l) => l.transcribed).slice(0, 3).map((l, i) => (
              <div key={l.slug} className="mb-3 rounded-2xl border border-line bg-card p-5">
                <p className="reading text-ink-2" style={{ maxWidth: "none", fontSize: "17px" }}>…[sample passage in which <mark className="rounded bg-gold-soft px-1 text-ink">{q || "your words"}</mark> appears, shown with the sentences around it]…</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-ink-3">
                  <button className="flex items-center gap-1.5 rounded-full bg-saffron-soft px-3 py-1 font-medium text-saffron"><Play size={12} />Play from {12 + i * 7}:{String(10 + i * 13).slice(0, 2)}</button>
                  <Link href={`/teachings/audio/${l.slug}`} className="hover:underline"><span className="text-maroon">{l.title}</span> · {fmtDate(l.date)} · {l.place}</Link>
                </div>
              </div>
            ))}
          </section>
          {lectures.length > 0 && <section><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">Lectures</p><div className="rounded-2xl border border-line bg-card/50 p-2">{lectures.slice(0, 8).map((l) => <LectureRow key={l.slug} l={l} />)}</div></section>}
        </div>
        <aside className="space-y-5">
          {topics.length > 0 && <div className="rounded-2xl border border-line bg-card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Topics</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{topics.slice(0, 8).map(({ c, t }) => <Link key={c} href={`/tattva/${t.slug}`} className="rounded-full bg-gold-soft px-2.5 py-1 text-[13px]">{c}</Link>)}</div></div>}
          <QuoteCard text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} />
        </aside>
      </div>
    </div>
  );
}
