import Link from "next/link";
import { Languages, ArrowRight } from "lucide-react";
import { ALL_LANGUAGES } from "@/lib/languages";
import { Container, PageHero } from "@/components/ui";
import { LanguageDirectory } from "@/components/language-directory";

export const metadata = { title: "Translations" };

export default function Page() {
  const n = (s: string) => ALL_LANGUAGES.filter((l) => l.status === s).length;
  return (
    <>
      <PageHero crumbs={[{ label: "Translations" }]} icon={Languages} title="Translations" bg="blue-mandala" intro="Every language has its own complete site: interface, lectures, quotes and books. Every translation is reviewed before it appears.">
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-2">
          <span><b className="text-[20px] text-ink">{n("live")}</b> live</span><span><b className="text-[20px] text-ink">{n("building")}</b> in progress</span><span><b className="text-[20px] text-ink">{n("planned")}</b> planned</span>
          <Link href="/about/contact" className="btn btn-primary ml-auto">Help translate<ArrowRight size={15} /></Link>
        </div>
      </PageHero>
      <Container className="pb-14"><LanguageDirectory /><p className="mt-2 text-center text-[12px] text-ink-3">Progress figures are samples for the prototype.</p></Container>
    </>
  );
}
