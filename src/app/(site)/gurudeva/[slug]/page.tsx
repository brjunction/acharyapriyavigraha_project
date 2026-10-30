import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CollectionPage } from "@/components/cms/collection";
import { ArchiveIndex, ArchiveItem } from "@/components/archive/views";
import { ARCHIVE_SLUGS, PROJECT_PAGES } from "@/lib/archive/routes";
import { listItems } from "@/lib/archive/server";
import { COLLECTIONS } from "@/lib/archive/config";
import { WhoIsGurudeva } from "@/components/gurudeva/who-is";
export const revalidate = 300;

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/gurudeva/") && h.split("/").length === 3 && !["timeline", "letters", "gallery", "diaries", "audio", "quotes"].includes(h.split("/")[2])).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const m = await cmsMetadata(["gurudeva", slug]); if (m.title) return m; if (slug === "who-is-srila-gurudeva") return { title: "Who is Śrīla Gurudeva?", description: "The life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, a dear disciple of Śrīla Prabhupāda, and the books about him." }; const c = COLLECTIONS[ARCHIVE_SLUGS[slug]]; if (c) return { title: c.label, description: c.intro }; if (PROJECT_PAGES[slug]) return { title: PROJECT_PAGES[slug][1], description: PROJECT_PAGES[slug][2] }; return m; }

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ section?: string; q?: string }> }) {
  const { slug } = await params; const sp = await searchParams;
  if (await hasCms(["gurudeva", slug])) return <CmsPage segments={["gurudeva", slug]} />;
  if (slug === "who-is-srila-gurudeva") return <WhoIsGurudeva />;
  if (ARCHIVE_SLUGS[slug]) return <ArchiveIndex coll={ARCHIVE_SLUGS[slug]} section={sp.section} q={sp.q} />;
  if (PROJECT_PAGES[slug]) {
    const [sec, title, intro] = PROJECT_PAGES[slug]; const xs = await listItems("projects", { section: sec });
    if (xs.length === 1) return <ArchiveItem coll="projects" slug={xs[0].slug} crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { href: COLLECTIONS.projects.base, label: "Projects" }, { label: title }]} />;
    return <ArchiveIndex coll="projects" section={sec} q={sp.q} title={title} intro={intro} crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { href: COLLECTIONS.projects.base, label: "Projects" }, { label: title }]} />;
  }
  const col = await CollectionPage({ route: `/gurudeva/${slug}`, crumbs: [{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "" }] }); if (col) return col;
  return <SectionPage href={`/gurudeva/${slug}`} />;
}
