import { cmsOverride } from "@/lib/cms/render";
import { getTimeline } from "@/lib/content/timeline";
import { LifeTimeline } from "@/components/timeline/life-timeline";

export const metadata = { title: "Life timeline", description: "The life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva in chapters, year by year, with the lectures recorded each year." };
export const revalidate = 300;

export default async function Page() {
  const cms = await cmsOverride("/gurudeva/timeline"); if (cms) return cms;
  const t = await getTimeline();
  return <LifeTimeline {...t} />;
}
