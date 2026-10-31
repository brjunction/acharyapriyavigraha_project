import { ArrowUpRight } from "lucide-react";
import { CutOut } from "@/components/motifs";
import { PrabhupadaWords } from "@/components/gurudeva/prabhupada-words";

export const metadata = { title: "Śrīla Prabhupāda", description: "Śrīla A.C. Bhaktivedanta Swami Prabhupāda, the beloved spiritual master of Śrī Śrīmad Gour Govinda Swāmī Gurudeva — and what he said about him." };

const STEPS: [string, string, string][] = [
  ["September 1974", "Vṛndāvana", "Śrīla Gurudeva met Śrīla Prabhupāda at ISKCON’s centre in Vṛndāvana, and was soon initiated as Gour Govinda Dāsa."],
  ["20 April 1975", "Vṛndāvana", "At the opening of the Śrī Śrī Kṛṣṇa-Balarāma temple he accepted sannyāsa."],
  ["1975 onwards", "Bhubaneswar", "On Śrīla Prabhupāda’s order he began ISKCON’s centre in Bhubaneswar, living in a mud hut."],
  ["12 February 1976", "Māyāpur", "Śrīla Prabhupāda wrote to him: “Krishna is with you and there is no need of disappointment.”"],
  ["January 1977", "Bhubaneswar", "Śrīla Prabhupāda came to Bhubaneswar and laid the foundation stone of the temple."],
];
const LINKS: [string, string, string][] = [
  ["Śrīla Prabhupāda’s books", "https://vedabase.io/en/library/", "Bhagavad-gītā As It Is, Śrīmad-Bhāgavatam, Caitanya-caritāmṛta and more, on Vedabase"],
  ["Śrīla Prabhupāda-līlāmṛta", "https://vedabase.io/en/library/spl/", "His biography by Satsvarūpa dāsa Goswami"],
  ["Lectures, conversations and letters", "https://prabhupadavani.org", "Prabhupāda Vāṇī"],
];

/** Śrīla Prabhupāda: who he is to Śrīla Gurudeva, the moments they shared, his own words about him, and where to read him. */
export default function Page() {
  return (
    <div className="bg-white">
      <section className="border-b border-[#efe4cf] bg-[#fbf6ec]">
        <div className="mx-auto grid max-w-[1100px] items-end gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="pb-10 lg:pb-16">
            <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px]">His beloved spiritual master</p>
            <h1 className="text-[28px] leading-[1.15] text-ink sm:text-[38px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Śrīla A.C. Bhaktivedanta Swami Prabhupāda</h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">The founder-ācārya of ISKCON, who carried Śrī Caitanya Mahāprabhu’s message to every part of the world. Śrīla Gurudeva gave him his whole life, and Śrīla Prabhupāda said of him, “Kṛṣṇa sent him.”</p>
          </div>
          <CutOut src="/legacy/prabhupada.webp" alt="Śrīla A.C. Bhaktivedanta Swami Prabhupāda" fade={0} className="mx-auto w-[240px] sm:w-[300px]" />
        </div>
      </section>
      <div className="mx-auto grid max-w-[1100px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <section><h2 className="mb-4 text-[14px] font-semibold text-ink">Śrīla Prabhupāda and Śrīla Gurudeva</h2>
            <ol className="relative border-l border-[#e6d6b8]">{STEPS.map(([d, p, t]) => <li key={d} className="relative mb-5 pl-5 last:mb-0"><span className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-saffron" /><p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-saffron">{d} · {p}</p><p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-2">{t}</p></li>)}</ol>
          </section>
          <section><h2 className="mb-3 text-[14px] font-semibold text-ink">Read Śrīla Prabhupāda</h2>
            <div className="space-y-2">{LINKS.map(([t, u, d]) => <a key={u} href={u} target="_blank" rel="noreferrer" className="group flex items-start gap-3 rounded-xl border border-line p-3 hover:border-line-strong"><span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium text-ink group-hover:underline">{t}</span><span className="block text-[12px] leading-snug text-ink-3">{d}</span></span><ArrowUpRight size={14} className="mt-0.5 text-ink-3" /></a>)}</div>
          </section>
        </aside>
        <section><p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px]">In his own words</p><h2 className="mb-4 text-[22px] text-ink sm:text-[26px]" style={{ fontFamily: "var(--font-reading-serif)" }}>Śrīla Prabhupāda on Śrīla Gurudeva</h2><PrabhupadaWords /></section>
      </div>
    </div>
  );
}
