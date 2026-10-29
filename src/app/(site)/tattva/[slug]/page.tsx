import Link from "next/link";
import { notFound } from "next/navigation";
import { Network } from "lucide-react";
import { LECTURES, TATTVA, QUOTE_OF_DAY } from "@/lib/data";
import { Container, PageHero, QuoteCard } from "@/components/ui";
import { LectureRow } from "@/components/lecture";

export function generateStaticParams() { return TATTVA.map((t) => ({ slug: t.slug })); }

export default async function Concept({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TATTVA.find((x) => x.slug === slug);
  if (!t) notFound();
  const tabs: [string, number][] = [["Lectures", 48], ["Lecture moments", 212], ["Quotes", 64], ["Books & chapters", 17], ["Stories", 9], ["Q&A", 22], ["Verses", 31]];
  return (
    <>
      <PageHero crumbs={[{ href: "/tattva", label: "Tattva" }, { label: t.name }]} icon={Network} title={t.name} intro={`${t.count} passages, lectures and quotes gathered on this subject.`}>
        <div className="mt-6 flex flex-wrap gap-2">{t.children.map((c) => <span key={c} className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-serif text-[14.5px] font-bold text-ink-2">{c}</span>)}</div>
      </PageHero>
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line">
            {tabs.map(([n, c], i) => <button key={n} className={`shrink-0 border-b-2 px-4 py-3 text-[13px] ${i === 0 ? "border-saffron font-medium text-saffron" : "border-transparent text-ink-3 hover:text-ink"}`}>{n} <span className="ml-1 rounded-full bg-band px-1.5 text-[11px] tabular">{c}</span></button>)}
          </div>
          <p className="mt-6 text-[12.5px] font-medium text-saffron">Start here, chosen by the editors</p>
          <div className="card mt-2 px-2">{LECTURES.slice(0, 7).map((l) => <LectureRow key={l.slug} l={l} />)}</div>
        </div>
        <aside className="space-y-5">
          <QuoteCard text={QUOTE_OF_DAY.text} source="Key quote, sample placement" />
          <div className="card p-5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Related subjects</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{TATTVA.filter((x) => x.slug !== t.slug).slice(0, 6).map((x) => <Link key={x.slug} href={`/tattva/${x.slug}`} className="rounded-full bg-band px-3 py-1 text-[12.5px] text-ink-2 hover:bg-saffron-soft hover:text-saffron">{x.name}</Link>)}</div>
          </div>
        </aside>
      </Container>
    </>
  );
}
