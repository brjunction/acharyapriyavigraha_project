import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CollectionPage } from "@/components/cms/collection";
import { BooksShelf } from "@/components/cms/books-shelf";
import { getLectures } from "@/lib/cms/library";
import { AudioLibrary } from "../audio/library";
import { PageHero } from "@/components/ui";
import { Music } from "lucide-react";
export const revalidate = 300;

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/teachings/") && h.split("/").length === 3 && !["timeline", "letters", "gallery", "diaries", "audio", "quotes"].includes(h.split("/")[2])).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return cmsMetadata(["teachings", slug]); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (await hasCms(["teachings", slug])) return <CmsPage segments={["teachings", slug]} />;
  const crumbs = [{ href: "/teachings", label: "His Teachings" }, { label: slug.replace(/-/g, " ") }];
  if (slug === "books") { const b = await BooksShelf(); if (b) return b; }
  if (slug === "kirtans") { const songs = await getLectures(true); if (songs) return <><PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Kīrtanas & bhajanas" }]} icon={Music} title="Kīrtanas & bhajanas" intro="Songs he sang and led. Press play and keep browsing." /><AudioLibrary lectures={songs} /></>; }
  const col = await CollectionPage({ route: `/teachings/${slug}`, crumbs }); if (col) return col;
  return <SectionPage href={`/teachings/${slug}`} />;
}
