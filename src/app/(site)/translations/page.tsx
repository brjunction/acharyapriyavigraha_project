import { LANGUAGES } from "@/lib/data";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Translations" };

const Bar = ({ v, c }: { v: number; c: string }) => <div className="h-1.5 rounded-full bg-paper-2"><div className={`h-full rounded-full ${c}`} style={{ width: `${Math.min(100, v)}%` }} /></div>;

export default function Translations() {
  return (
    <>
      <PageHead eyebrow="Translations" title="His words in every language"
        intro="Volunteer translators around the world are bringing Śrīla Gurudeva's teachings into their languages. Every translation is reviewed before it appears.">
        <a href="/soon?t=Help%20translate" className="mt-6 inline-block rounded-full bg-tulasi px-5 py-2.5 text-sm font-medium text-white">Help translate</a>
      </PageHead>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {LANGUAGES.map((l) => (
          <div key={l.code} className="rounded-2xl border border-line bg-card p-6 transition hover:border-gold hover:shadow-md">
            <p className="font-serif text-3xl">{l.native}</p><p className="text-sm text-ink-3">{l.name}</p>
            <div className="mt-5 space-y-3 text-[13px]">
              <div><div className="mb-1 flex justify-between"><span>Interface</span><span className="text-ink-3">{l.ui}%</span></div><Bar v={l.ui} c="bg-tulasi" /></div>
              <div><div className="mb-1 flex justify-between"><span>Quotes</span><span className="text-ink-3">{l.quotes}</span></div><Bar v={l.quotes / 18.4} c="bg-saffron" /></div>
              <div><div className="mb-1 flex justify-between"><span>Transcriptions</span><span className="text-ink-3">{l.transcripts} / 130</span></div><Bar v={(l.transcripts / 130) * 100} c="bg-maroon" /></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-ink-3">Numbers are sample figures for the prototype.</p>
    </>
  );
}
