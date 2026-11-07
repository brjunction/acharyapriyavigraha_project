import { ItemPage, ROUTES } from "@/components/cms/collection";
import { NestedPage } from "@/lib/cms/render";
import { VideoPage, ShelfPage, SectionPage, ChannelsPage, SearchVideosPage, VideosShell } from "@/components/media/video-page";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string; rest: string[] }>; searchParams: Promise<{ list?: string; sec?: string; q?: string }> }) {
  const { slug, rest } = await params; const route = `/teachings/${slug}`;
  if (slug === "videos") {
    const sp = await searchParams;
    if (rest.length === 2 && rest[0] === "list") return <ShelfPage id={rest[1]} />;
    if (rest.length === 2 && rest[0] === "s") return <SectionPage slug={rest[1]} />;
    if (rest.length === 1 && rest[0] === "channels") return <ChannelsPage />;
    if (rest.length === 1 && rest[0] === "search") return <SearchVideosPage q={sp.q} />;
    if (rest.length === 1) return <VideosShell active={sp.sec || ""}><VideoPage slug={rest[0]} list={sp.list} sec={sp.sec} /></VideosShell>;
  }
  return <NestedPage segments={["teachings", slug, ...rest]} fallback={rest.length === 1 && ROUTES[route]?.table === "excerpts" ? async () => <ItemPage route={route} slug={rest[0]} /> : undefined} />;
}
