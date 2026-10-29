import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/resources/") && h.split("/").length === 3).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return cmsMetadata(["resources", slug]); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (await hasCms(["resources", slug])) return <CmsPage segments={["resources", slug]} />;
  return <SectionPage href={`/resources/${slug}`} />;
}
