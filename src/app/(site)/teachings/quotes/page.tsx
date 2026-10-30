import { CollectionPage } from "@/components/cms/collection";
import { cmsOverride } from "@/lib/cms/render";
import { CompilationsHeader } from "@/components/compilations/header";

export const metadata = { title: "Quotes", description: "Quotations of Śrī Śrīmad Gour Govinda Swāmī Gurudeva by topic, A to Z, each with its exact source." };
export const revalidate = 300;

export default async function Page() {
  const cms = await cmsOverride('/teachings/quotes'); if (cms) return cms;
  const col = await CollectionPage({ route: '/teachings/quotes', crumbs: [{ href: "/teachings", label: "His Teachings" }, { label: "Quotes" }] }); if (col) return col;
  return <><CompilationsHeader at="/teachings/quotes" title="Quotes" intro="Short quotations, each with its exact source." stats={[]} /><p className="py-20 text-center text-[13.5px] text-ink-3">Quotes will appear here once they are added in the Studio.</p></>;
}
