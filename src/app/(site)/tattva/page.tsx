import Link from "next/link";
import { TATTVA } from "@/lib/data";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Tattva-kośa" };

export default function Tattva() {
  return (
    <>
      <PageHead eyebrow="Tattva-kośa · treasury of truths" title="Everything he taught, by subject"
        intro="Each topic gathers every quote, lecture moment, book chapter, story and verse where Śrīla Gurudeva speaks on it, in every language." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TATTVA.map((t, i) => (
            <Link key={t.slug} href={`/tattva/${t.slug}`} className="group rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-[26px] text-ink group-hover:text-maroon">{t.name}</h2>
                <span className="text-xs text-ink-3">{t.count} items</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.children.map((c) => <span key={c} className={`rounded-full px-2.5 py-1 text-[13px] ${["bg-gold-soft", "bg-saffron-soft", "bg-tulasi-soft"][i % 3]} text-ink-2`}>{c}</span>)}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["People index", "Prahlāda, Haridāsa Ṭhākura, Bhaktivinoda…"], ["Places index", "Holy places he spoke about"], ["Verse index", "BG · SB · CC · Upaniṣads"], ["A–Z index", "Everything, alphabetically"]].map(([a, b]) => (
            <Link key={a} href={`/soon?t=${encodeURIComponent(a)}`} className="rounded-2xl border border-dashed border-line p-5 hover:border-gold"><p className="font-serif text-xl">{a}</p><p className="text-sm text-ink-3">{b}</p></Link>
          ))}
        </div>
      </div>
    </>
  );
}
