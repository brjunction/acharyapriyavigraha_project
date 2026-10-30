import { ItemPage, ROUTES } from "@/components/cms/collection";
import { NestedPage } from "@/lib/cms/render";
import { ArchiveItem } from "@/components/archive/views";
import { ARCHIVE_SLUGS } from "@/lib/archive/routes";
import { getItem } from "@/lib/archive/server";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string; rest: string[] }> }) {
  const { slug, rest } = await params; const route = `/gurudeva/${slug}`;
  const coll = ARCHIVE_SLUGS[slug]; if (coll && rest.length === 1 && (await getItem(coll, rest[0]))) return <ArchiveItem coll={coll} slug={rest[0]} />;
  return <NestedPage segments={["gurudeva", slug, ...rest]} fallback={rest.length === 1 && ROUTES[route]?.table === "excerpts" ? async () => <ItemPage route={route} slug={rest[0]} /> : undefined} />;
}
