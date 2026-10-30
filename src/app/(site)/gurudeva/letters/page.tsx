import { cmsOverride } from "@/lib/cms/render";
import { ArchiveIndex } from "@/components/archive/views";
import { COLLECTIONS } from "@/lib/archive/config";

export const metadata = { title: "Letters", description: COLLECTIONS.letters.intro };
export const revalidate = 300;

export default async function Page({ searchParams }: { searchParams: Promise<{ section?: string; q?: string }> }) {
  const cms = await cmsOverride("/gurudeva/letters"); if (cms) return cms;
  const { section, q } = await searchParams; return <ArchiveIndex coll="letters" section={section} q={q} />;
}
