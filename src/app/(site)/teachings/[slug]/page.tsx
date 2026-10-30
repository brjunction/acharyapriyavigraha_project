import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CollectionPage } from "@/components/cms/collection";
import { BooksShelf } from "@/components/cms/books-shelf";
import { getLectures } from "@/lib/cms/library";
import { getVideos } from "@/lib/cms/library";
import { MediaLibrary, type MediaItem } from "@/components/media/library";
import { MediaHeader } from "@/components/media/header";
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
  if (slug === "kirtans") { const songs = ((await getLectures(true)) ?? []) as MediaItem[]; return <><MediaHeader at="/teachings/kirtans" title="Kīrtanas & bhajanas" intro="Songs he sang and led. Find them by song, author, place or year." stats={[`${songs.length.toLocaleString()} recordings`]} /><MediaLibrary items={songs} mode="kirtan" /></>; }
  if (slug === "videos") { const vs = (await getVideos()) as MediaItem[]; return <><MediaHeader at="/teachings/videos" title="Videos" intro="Lectures, kīrtanas and festivals on video, gathered from the YouTube channels and sorted by year, place and type." stats={[`${vs.length.toLocaleString()} videos`]} /><MediaLibrary items={vs} mode="video" /></>; }
  const col = await CollectionPage({ route: `/teachings/${slug}`, crumbs }); if (col) return col;
  return <SectionPage href={`/teachings/${slug}`} />;
}
