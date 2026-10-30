import { ItemPage, ROUTES } from "@/components/cms/collection";
import { NestedPage } from "@/lib/cms/render";
import { VideoPage } from "@/components/media/video-page";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string; rest: string[] }> }) {
  const { slug, rest } = await params; const route = `/teachings/${slug}`;
  if (slug === "videos" && rest.length === 1) return <VideoPage slug={rest[0]} />;
  return <NestedPage segments={["teachings", slug, ...rest]} fallback={rest.length === 1 && ROUTES[route]?.table === "excerpts" ? async () => <ItemPage route={route} slug={rest[0]} /> : undefined} />;
}
