import { cmsOverride } from "@/lib/cms/render";
import { ArchiveIndex } from "@/components/archive/views";
import { COLLECTIONS } from "@/lib/archive/config";

export const metadata = { title: "Gallery", description: COLLECTIONS.gallery.intro };
export const revalidate = 300;

export default async function Page({ searchParams }: { searchParams: Promise<{ section?: string; q?: string }> }) {
  const cms = await cmsOverride("/gurudeva/gallery"); if (cms) return cms;
  const { section, q } = await searchParams; return <ArchiveIndex coll="gallery" section={section} q={q} />;
}
