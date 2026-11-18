import { notFound } from "next/navigation";
import { VersesIndex, YearsIndex, PlacesIndex, PeopleIndex, GlossaryIndex, AZIndex, INDEXES } from "@/components/tattva/indexes";

export const revalidate = 600;
export function generateStaticParams() { return INDEXES.map(([name]) => ({ name })); }
export const dynamicParams = false;
const META: Record<string, [string, string]> = { verses: ["Verse index", "Every lecture of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, verse by verse: Śrīmad-Bhāgavatam, Bhagavad-gītā, Caitanya-caritāmṛta and more."], years: ["Years", "The life and teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva year by year: life moments, lectures, videos, letters and diary."], places: ["Places", "The places where Śrī Śrīmad Gour Govinda Swāmī Gurudeva lived, spoke and travelled, with everything from each."], people: ["People", "The personalities in the life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva."], glossary: ["Glossary", "Sanskrit and Odia terms as Śrī Śrīmad Gour Govinda Swāmī Gurudeva used them."], "a-z": ["A–Z", "Everything in the Taptajīvanam archive, alphabetically."] };
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) { const { name } = await params; const m = META[name]; return m ? { title: `${m[0]} — Tattva`, description: m[1], alternates: { canonical: `/tattva/index/${name}` } } : {}; }

export default async function Page({ params, searchParams }: { params: Promise<{ name: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { name } = await params; const sp = await searchParams;
  switch (name) {
    case "verses": return <VersesIndex s={sp.s} />;
    case "years": return <YearsIndex y={Number(sp.y) || undefined} />;
    case "places": return <PlacesIndex p={sp.p} />;
    case "people": return <PeopleIndex who={sp.who} />;
    case "glossary": return <GlossaryIndex />;
    case "a-z": return <AZIndex k={sp.k} l={sp.l} />;
  }
  notFound();
}
