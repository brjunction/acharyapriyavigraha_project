import { cmsOverride } from "@/lib/cms/render";
import { DiaryReader } from "@/components/diary/diary-reader";
import { diaryIndex } from "@/lib/content/diary-public";

export const metadata = { title: "His Diary — prayers to Śrī Gopāl Jiu", description: "The diary Śrī Śrīmad Gour Govinda Swāmī Gurudeva wrote throughout his life as prayers to his beloved Deity, Śrī Gopāl Jiu." };
export const revalidate = 300;

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const cms = await cmsOverride("/gurudeva/diaries"); if (cms) return cms;
  const [list, { e }] = await Promise.all([diaryIndex(), searchParams]);
  return <DiaryReader entries={list} start={e} />;
}
