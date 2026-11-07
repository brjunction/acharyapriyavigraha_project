import { ItemPage, ROUTES } from "@/components/cms/collection";
import { NestedPage } from "@/lib/cms/render";
import { VideoPage, ShelfPage } from "@/components/media/video-page";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string; rest: string[] }>; searchParams: Promise<{ list?: string }> }) {
  const { slug, rest } = await params; const route = `/teachings/${slug}`;
  if (slug === "videos" && rest.length === 2 && rest[0] === "list") return <ShelfPage id={rest[1]} />;
  if (slug === "videos" && rest.length === 1) return <VideoPage slug={rest[0]} list={(await searchParams).list} />;
  return <NestedPage segments={["teachings", slug, ...rest]} fallback={rest.length === 1 && ROUTES[route]?.table === "excerpts" ? async () => <ItemPage route={route} slug={rest[0]} /> : undefined} />;
}
