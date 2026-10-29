import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CollectionPage } from "@/components/cms/collection";
export const revalidate = 300;

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/gurudeva/") && h.split("/").length === 3 && !["timeline", "letters", "gallery", "diaries", "audio", "quotes"].includes(h.split("/")[2])).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return cmsMetadata(["gurudeva", slug]); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (await hasCms(["gurudeva", slug])) return <CmsPage segments={["gurudeva", slug]} />;
  const col = await CollectionPage({ route: `/gurudeva/${slug}`, crumbs: [{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "" }] }); if (col) return col;
  return <SectionPage href={`/gurudeva/${slug}`} />;
}
