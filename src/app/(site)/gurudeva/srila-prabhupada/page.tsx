import { Crown, Quote as QuoteIcon, Mail } from "lucide-react";
import { Container, PageHero } from "@/components/ui";
import { CutOut } from "@/components/motifs";

export const metadata = { title: "Śrīla Prabhupāda on Śrīla Gurudeva" };

import { CONVERSATION as C, LETTER as L } from "@/lib/prabhupada";
const hl = (t: string) => t.split(/(«[^»]+»)/).map((x, k) => x.startsWith("«") ? <mark key={k} className="rounded bg-[#f6d58e]/70 px-1 font-semibold text-ink">{x.slice(1, -1)}</mark> : <span key={k}>{x}</span>);

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "Śrīla Prabhupāda" }]} icon={Crown} title="Śrīla Prabhupāda on Śrīla Gurudeva" intro="What his spiritual master said about him, in Śrīla Prabhupāda's own words: a room conversation and a letter."
        aside={<CutOut src="/legacy/prabhupada.webp" alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" fade={0} className="mx-auto hidden w-64 lg:block" />} />
      <Container className="max-w-3xl py-14">
        <section>
          <div className="flex items-center gap-3"><QuoteIcon className="text-saffron" size={20} /><h2 className="text-[22px]">{C.title}</h2></div>
          <p className="mt-1 text-[13px] text-ink-3">Speakers: {C.speakers}.</p>
          <div className="card mt-5 divide-y divide-line">
            {C.lines.map(([who, line], i) => (
              <p key={i} className="px-5 py-3 text-[15px] leading-relaxed"><span className={`mr-2 font-semibold ${who === "Prabhupāda" ? "text-saffron" : "text-ink-2"}`}>{who}:</span>{hl(line)}</p>
            ))}
          </div>
        </section>
        <section className="mt-14">
          <div className="flex items-center gap-3"><Mail className="text-saffron" size={20} /><h2 className="text-[22px]">{L.title}</h2></div>
          <p className="mt-1 text-[13px] text-ink-3">Letter {L.ref}</p>
          <article className="card mt-5 space-y-4 p-6 text-[15.5px] leading-relaxed text-ink-2">
            <p>{L.salutation}</p>
            {L.paras.map((t, i) => <p key={i}>{hl(t)}</p>)}
            <p className="text-ink-3">{L.closing[0]}<br />{L.closing[1]}<br /><span className="text-[12.5px]">{L.closing[2]}</span></p>
          </article>
        </section>
      </Container>
    </>
  );
}
