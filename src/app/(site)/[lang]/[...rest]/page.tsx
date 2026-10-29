import Link from "next/link";
import { NestedPage, cmsMetadata } from "@/lib/cms/render";
import { notFound } from "next/navigation";
import { Hourglass } from "lucide-react";
import { ALL_LANGUAGES } from "@/lib/languages";
import { Container, EmptyState, PageHero } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; rest: string[] }> }) { const { lang, rest } = await params; return ALL_LANGUAGES.some((x) => x.code === lang) ? {} : cmsMetadata([lang, ...rest]); }

export default async function Page({ params }: { params: Promise<{ lang: string; rest: string[] }> }) {
  const { lang, rest } = await params;
  const l = ALL_LANGUAGES.find((x) => x.code === lang && x.code !== "en");
  if (!l) return <NestedPage segments={[lang, ...rest]} />;
  const name = rest.join(" / ");
  return (
    <>
      <PageHero crumbs={[{ href: `/${lang}`, label: l.native }, { label: name }]} title={`${l.native}: ${name}`} intro={`The ${name} section of the ${l.name} site.`} />
      <Container className="py-14"><EmptyState icon={Hourglass} title="Translations arrive from the dashboard" text="Once translators publish reviewed translations, they appear here automatically." /><p className="mt-4 text-center"><Link href={`/${lang}`} className="text-saffron">Back to {l.native}</Link></p></Container>
    </>
  );
}
