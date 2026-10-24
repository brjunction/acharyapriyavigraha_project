import Link from "next/link";
import { Languages, ArrowRight } from "lucide-react";
import { LANGUAGES } from "@/lib/data";
import { Container, PageHero } from "@/components/ui";

export const metadata = { title: "Translations" };

const Bar = ({ label, v, of }: { label: string; v: number; of: number }) => (
  <div><div className="mb-1 flex justify-between text-[12.5px]"><span className="text-ink-2">{label}</span><span className="tabular text-ink-3">{of === 100 ? `${v}%` : `${v} / ${of}`}</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-band"><div className="h-full rounded-full bg-saffron" style={{ width: `${Math.min(100, (v / of) * 100)}%` }} /></div></div>
);

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "Translations" }]} icon={Languages} title="Translations" intro="Each language has its own complete site, with the interface, lectures, quotes and books in that language. Every translation is reviewed before it appears.">
        <Link href="/about/contact" className="btn btn-primary mt-6">Help translate<ArrowRight size={16} /></Link>
      </PageHero>
      <Container className="py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGES.map((l) => (
            <Link key={l.code} href={l.code === "en" ? "/" : `/${l.code}`} className="card card-hover group flex flex-col p-6">
              <p className="font-serif text-[24px] font-bold leading-tight group-hover:text-saffron">{l.native}</p>
              <p className="text-[13px] text-ink-3">{l.name} · taptajivanam.com/{l.code === "en" ? "" : l.code}</p>
              <div className="mt-6 space-y-3"><Bar label="Interface" v={l.ui} of={100} /><Bar label="Quotes" v={l.quotes} of={1840} /><Bar label="Transcriptions" v={l.transcripts} of={130} /></div>
              <span className="mt-6 flex items-center gap-1 text-[13.5px] font-medium text-saffron">Open site<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-3">Figures are samples for the prototype.</p>
      </Container>
    </>
  );
}
