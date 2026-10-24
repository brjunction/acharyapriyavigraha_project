import { Mail, ArrowRight } from "lucide-react";
import { LETTERS, fmtDate } from "@/lib/data";
import { Container, PageHero } from "@/components/ui";

export const metadata = { title: "Letters" };

export default function Page() {
  const groups: [string, number][] = [["With Śrīla Prabhupāda", 25], ["With disciples", 0], ["With others", 4]];
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Letters" }]} icon={Mail} title="Letters" intro="29 letters: 25 between Śrīla Prabhupāda and Śrīla Gurudeva, and 4 with others. Each with the scanned original where available, the text and translations." />
      <Container className="max-w-4xl py-14">
        {groups.map(([g, n]) => {
          const items = LETTERS.filter((l) => l.group === g);
          return (
            <section key={g} className="mb-12">
              <div className="mb-4 flex items-baseline gap-3"><h2 className="text-[21px]">{g}</h2><span className="text-[14px] text-ink-3">{n} letters</span></div>
              {items.length ? (
                <div className="card divide-y divide-line">
                  {items.map((l) => (
                    <a key={l.date} href="#" className="group flex items-center gap-4 px-5 py-4 hover:bg-saffron-tint">
                      <span className="mega-ic !h-11 !w-11"><Mail size={18} strokeWidth={1.7} /></span>
                      <span className="flex-1"><span className="block font-serif text-[18px] font-bold group-hover:text-saffron">{l.from} to {l.to}</span><span className="text-[13px] text-ink-3">{fmtDate(l.date)} · sample entry</span></span>
                      <ArrowRight size={16} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-saffron" />
                    </a>
                  ))}
                </div>
              ) : <p className="card p-8 text-center text-[14.5px] text-ink-2">No letters in this group yet.</p>}
            </section>
          );
        })}
      </Container>
    </>
  );
}
