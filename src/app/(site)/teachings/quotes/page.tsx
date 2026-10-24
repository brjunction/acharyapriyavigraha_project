import { Quote, Shuffle } from "lucide-react";
import { QUOTE_CATEGORIES, QUOTE_OF_DAY } from "@/lib/data";
import { Container, PageHero, QuoteCard, SectionHead } from "@/components/ui";

export const metadata = { title: "Quotes" };

export default function Page() {
  const groups = QUOTE_CATEGORIES.reduce<Record<string, string[]>>((a, c) => { (a[c[0].toUpperCase()] ??= []).push(c); return a; }, {});
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Quotes" }]} icon={Quote} title="Quotes"
        intro="Short passages from his lectures and books, by subject. Every quote links to the lecture and the moment it comes from.">
        <button className="btn btn-primary mt-6"><Shuffle size={16} />Inspire me</button>
      </PageHero>
      <Container className="py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <QuoteCard large text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} place={QUOTE_OF_DAY.place} />
          <QuoteCard sample text="Sample quote. Real quotes appear here once the archive is moved over." source="Lecture on SB 1.2.6" />
          <QuoteCard sample text="Sample quote. Each one can be shared as an image card in any language." source="Darśana" />
        </div>
        <div className="mt-20"><SectionHead title={`All ${QUOTE_CATEGORIES.length} subjects`} /></div>
        <div className="columns-1 gap-10 sm:columns-2 lg:columns-3">
          {Object.entries(groups).map(([k, v]) => (
            <div key={k} className="mb-7 break-inside-avoid">
              <p className="font-serif text-[24px] font-bold text-saffron/70">{k}</p>
              <ul className="mt-1">{v.map((c) => <li key={c}><a href="#" className="group flex items-center justify-between rounded-lg px-3 py-2 text-[15px] text-ink-2 transition hover:bg-surface hover:text-saffron">{c}<span className="text-ink-3 opacity-0 transition group-hover:opacity-100">→</span></a></li>)}</ul>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
