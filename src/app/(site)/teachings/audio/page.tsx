import { cmsOverride } from "@/lib/cms/render";
import { getLectures } from "@/lib/cms/library";
import { MediaLibrary, type MediaItem } from "@/components/media/library";
import { MediaHeader } from "@/components/media/header";
import { LECTURES } from "@/lib/data";

export const revalidate = 300;
export const metadata = { title: "Audio lectures", description: "Every recorded lecture of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, organised by year, place, scripture, type, series and topic, with transcriptions." };

export default async function Page() {
  const cms = await cmsOverride("/teachings/audio"); if (cms) return cms;
  const items = ((await getLectures()) ?? LECTURES) as MediaItem[];
  const ys = items.map((l) => l.date.slice(0, 4)).filter(Boolean).sort(); const t = items.filter((l) => l.transcribed).length;
  return <>
    <MediaHeader at="/teachings/audio" title="Audio lectures" intro="Every recorded lecture, remastered. Narrow by year, place, scripture or type; press play and keep browsing — the player stays with you." stats={[`${items.length.toLocaleString()} lectures`, ...(t ? [`${t} transcribed`] : []), ...(ys.length ? [`${ys[0]}–${ys[ys.length - 1]}`] : [])]} />
    <MediaLibrary items={items} mode="audio" />
  </>;
}
