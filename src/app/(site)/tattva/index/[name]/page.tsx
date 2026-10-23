import { SectionPage } from "@/components/sections";

export function generateStaticParams() { return ["verses", "people", "places", "years", "glossary", "a-z"].map((name) => ({ name })); }
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <SectionPage href={`/tattva/index/${name}`} />;
}
