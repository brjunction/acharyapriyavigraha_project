import { TIMELINE } from "@/lib/data";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Life timeline" };

export default function Timeline() {
  return (
    <>
      <PageHead eyebrow="Śrīla Gurudeva" title="Life timeline" intro="Each period opens into the lectures, letters and photos from that time. (Prototype: short outline only.)" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ol className="relative border-l-2 border-gold/50">
          {TIMELINE.map((e, i) => (
            <li key={e.year} className="fade-up mb-10 ml-8" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="absolute -left-[9px] mt-2 h-4 w-4 rounded-full border-2 border-paper bg-saffron" />
              <p className="font-serif text-3xl text-gold">{e.year}</p>
              <h3 className="mt-1 font-serif text-2xl">{e.title}</h3>
              <p className="mt-1 text-ink-2">{e.text}</p>
              <div className="mt-3 flex gap-2 text-[12px] text-ink-3"><span className="rounded-full bg-paper-2 px-2 py-0.5">Lectures</span><span className="rounded-full bg-paper-2 px-2 py-0.5">Letters</span><span className="rounded-full bg-paper-2 px-2 py-0.5">Photos</span></div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
