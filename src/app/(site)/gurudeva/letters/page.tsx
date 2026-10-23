import { Mail } from "lucide-react";
import { LETTERS, fmtDate } from "@/lib/data";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Letters" };

export default function Letters() {
  const groups = ["With Śrīla Prabhupāda", "With disciples", "With others"];
  return (
    <>
      <PageHead eyebrow="Śrīla Gurudeva" title="Letters" intro="29 letters: 25 between Śrīla Prabhupāda and Śrīla Gurudeva, and 4 with others. Each has the scanned original (where available), the text and translations." />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {groups.map((g) => {
          const items = LETTERS.filter((l) => l.group === g);
          return (
            <section key={g} className="mb-10">
              <h2 className="font-serif text-2xl">{g} <span className="text-base text-ink-3">({g === "With Śrīla Prabhupāda" ? 25 : g === "With others" ? 4 : 0})</span></h2>
              {items.length ? <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
                {items.map((l) => (
                  <a key={l.date} href="#" className="flex items-center gap-4 px-5 py-4 hover:bg-paper-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold"><Mail size={18} /></span>
                    <div className="flex-1"><p className="font-serif text-lg">{l.from} → {l.to}</p><p className="text-[13px] text-ink-3">{fmtDate(l.date)} · sample entry</p></div>
                  </a>
                ))}
              </div> : <p className="mt-3 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-3">No letters yet in this group.</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}
