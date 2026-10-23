import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/teachings/") && h.split("/").length === 3 && !["timeline", "letters", "gallery", "diaries", "audio", "quotes"].includes(h.split("/")[2])).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SectionPage href={`/teachings/${slug}`} />;
}
