import { ItemPage, ROUTES } from "@/components/cms/collection";
import { NestedPage } from "@/lib/cms/render";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string; rest: string[] }> }) {
  const { slug, rest } = await params; const route = `/gurudeva/${slug}`;
  return <NestedPage segments={["gurudeva", slug, ...rest]} fallback={rest.length === 1 && ROUTES[route]?.table === "excerpts" ? async () => <ItemPage route={route} slug={rest[0]} /> : undefined} />;
}
