import Link from "next/link";
import { notFound } from "next/navigation";
import { LECTURES, TATTVA, QUOTE_OF_DAY } from "@/lib/data";
import { PageHead, QuoteCard } from "@/components/ui";
import { LectureRow } from "@/components/lecture";

export function generateStaticParams() { return TATTVA.map((t) => ({ slug: t.slug })); }

export default async function Concept({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TATTVA.find((x) => x.slug === slug);
  if (!t) notFound();
  const tabs = [["Quotes", 64], ["Lecture moments", 212], ["Lectures", 48], ["Books & chapters", 17], ["Stories", 9], ["Q&A", 22], ["Verses", 31]];
  return (
    <>
      <PageHead eyebrow={<><Link href="/tattva" className="hover:underline">Tattva-kośa</Link></>} title={t.name}>
        <div className="mt-6 max-w-3xl"><QuoteCard text={QUOTE_OF_DAY.text} source="Key quote (sample placement)" /></div>
        <div className="mt-6 flex flex-wrap gap-2">{t.children.map((c) => <span key={c} className="rounded-full border border-line bg-card px-3 py-1.5 font-serif text-[16px]">{c}</span>)}</div>
      </PageHead>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map(([n, c], i) => <button key={n} className={`shrink-0 border-b-2 px-4 py-3 text-sm ${i === 2 ? "border-maroon font-medium text-maroon" : "border-transparent text-ink-3 hover:text-ink"}`}>{n} <span className="ml-1 rounded-full bg-paper-2 px-1.5 text-[11px]">{c}</span></button>)}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-saffron">Start here · chosen by editors</p>
        <div className="mt-2 rounded-2xl border border-line bg-card/50 p-2">{LECTURES.slice(0, 6).map((l) => <LectureRow key={l.slug} l={l} />)}</div>
      </div>
    </>
  );
}
