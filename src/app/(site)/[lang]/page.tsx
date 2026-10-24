import Link from "next/link";
import { notFound } from "next/navigation";
import { Headphones, Quote, BookOpen, FileText, ArrowRight, Languages } from "lucide-react";
import { LANGUAGES, QUOTE_OF_DAY } from "@/lib/data";
import { Container, QuoteCard, ArchiveTile } from "@/components/ui";
import { PaisleyField, Rosette } from "@/components/motifs";

const COPY: Record<string, { welcome: string; intro: string }> = {
  hi: { welcome: "हरे कृष्ण, स्वागत है", intro: "श्रील गौर गोविन्द स्वामी के प्रवचन, उद्धरण और पुस्तकें हिन्दी में।" },
  or: { welcome: "ହରେ କୃଷ୍ଣ, ସ୍ୱାଗତ", intro: "ଶ୍ରୀଲ ଗୌର ଗୋବିନ୍ଦ ସ୍ୱାମୀଙ୍କ ପ୍ରବଚନ, ଉକ୍ତି ଓ ପୁସ୍ତକ ଓଡ଼ିଆରେ।" },
  bn: { welcome: "হরে কৃষ্ণ, স্বাগতম", intro: "শ্রীল গৌর গোবিন্দ স্বামীর প্রবচন, উদ্ধৃতি ও গ্রন্থ বাংলায়।" },
  ru: { welcome: "Харе Кришна, добро пожаловать", intro: "Лекции, цитаты и книги Шрилы Гоур Говинды Свами на русском языке." },
  nl: { welcome: "Hare Kṛṣṇa, welkom", intro: "Lezingen, citaten en boeken van Śrīla Gour Govinda Swāmī in het Nederlands." },
  id: { welcome: "Hare Kṛṣṇa, selamat datang", intro: "Ceramah, kutipan, dan buku Śrīla Gour Govinda Swāmī dalam bahasa Indonesia." },
  es: { welcome: "Hare Kṛṣṇa, bienvenidos", intro: "Conferencias, citas y libros de Śrīla Gour Govinda Swāmī en español." },
};

export function generateStaticParams() { return LANGUAGES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code })); }
export const dynamicParams = false;

export default async function LanguageHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = LANGUAGES.find((x) => x.code === lang);
  if (!l) notFound();
  const c = COPY[lang];
  return (
    <>
      <section className="relative overflow-hidden bg-[#2f2622] text-white">
        <PaisleyField className="text-white/[0.04]" />
        <Rosette className="spin-slow absolute -left-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 text-[#c47f6e]/20" />
        <Container className="relative py-20 text-center sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[13px] text-white/80"><Languages size={14} />{l.native} · {l.name}</p>
          <h1 className="mt-6 text-[32px] leading-tight text-white sm:text-[40px]">{c.welcome}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] text-white/80">{c.intro}</p>
          <div className="mx-auto mt-8 flex max-w-md items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#d8907e]" style={{ width: `${l.ui}%` }} /></div>
            <span className="text-[13px] text-white/70">{l.ui}% translated</span>
          </div>
        </Container>
      </section>
      <Container className="py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ArchiveTile tone="saffron" href={`/${lang}/lectures`} icon={Headphones} title="Lectures" desc="Lecture titles and summaries in this language." count={`${l.transcripts} transcripts`} />
          <ArchiveTile tone="charcoal" href={`/${lang}/quotes`} icon={Quote} title="Quotes" desc="Quotes translated and reviewed." count={`${l.quotes} quotes`} />
          <ArchiveTile tone="saffron" href={`/${lang}/books`} icon={BookOpen} title="Books" desc="Books published in this language." />
          <ArchiveTile tone="charcoal" href={`/${lang}/transcriptions`} icon={FileText} title="Transcriptions" desc="Side by side with the English original." />
        </div>
        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
          <QuoteCard large text={QUOTE_OF_DAY.text} source={`${QUOTE_OF_DAY.source}. Translation shown here once reviewed.`} />
          <div className="card flex flex-col justify-center p-8">
            <h2 className="text-[21px]">Help translate into {l.name}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Translators work in the dashboard, paragraph by paragraph, with a reviewer for every language.</p>
            <Link href="/about/contact" className="btn btn-primary mt-5 self-start">Join the team<ArrowRight size={16} /></Link>
          </div>
        </div>
      </Container>
    </>
  );
}
