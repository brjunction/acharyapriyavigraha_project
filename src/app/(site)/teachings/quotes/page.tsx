import { Shuffle } from "lucide-react";
import { QUOTE_CATEGORIES, QUOTE_OF_DAY } from "@/lib/data";
import { PageHead, QuoteCard } from "@/components/ui";

export const metadata = { title: "Quotes" };

export default function Quotes() {
  const groups = QUOTE_CATEGORIES.reduce<Record<string, string[]>>((a, c) => { (a[c[0].toUpperCase()] ??= []).push(c); return a; }, {});
  return (
    <>
      <PageHead eyebrow="Compilations" title="Quotes" intro="Short passages from his lectures and books, grouped by subject. Every quote links to the lecture and the moment it comes from.">
        <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-paper"><Shuffle size={16} />Inspire me</button>
      </PageHead>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <QuoteCard text={QUOTE_OF_DAY.text} source={QUOTE_OF_DAY.source} date={QUOTE_OF_DAY.date} place={QUOTE_OF_DAY.place} />
          <QuoteCard sample text="[Sample quote. The real quotes appear here once the archive is moved over.]" source="Lecture on SB 1.2.6" date="sample" />
          <QuoteCard sample text="[Sample quote. Each one can be shared as an image card in any language.]" source="Darśana" date="sample" />
        </div>
        <h2 className="mt-14 font-serif text-3xl">All {QUOTE_CATEGORIES.length} subjects</h2>
        <div className="mt-6 columns-1 gap-8 sm:columns-2 lg:columns-3">
          {Object.entries(groups).map(([k, v]) => (
            <div key={k} className="mb-6 break-inside-avoid">
              <p className="font-serif text-2xl text-gold">{k}</p>
              <ul className="mt-1 space-y-1">{v.map((c) => <li key={c}><a href="#" className="flex justify-between rounded-lg px-2 py-1.5 text-[15px] text-ink-2 hover:bg-card hover:text-ink">{c}<span className="text-xs text-ink-3">→</span></a></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
