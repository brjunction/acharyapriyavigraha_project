import { NestedPage } from "@/lib/cms/render";
import { ArchiveItem } from "@/components/archive/views";
import { getItem } from "@/lib/archive/server";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  if (rest.length === 1 && (await getItem("letters", rest[0]))) return <ArchiveItem coll="letters" slug={rest[0]} />;
  return <NestedPage segments={["gurudeva", "letters", ...rest]} />;
}
