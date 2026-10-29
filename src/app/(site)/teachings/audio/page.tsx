import { cmsOverride } from "@/lib/cms/render";
import { Headphones } from "lucide-react";
import { PageHero } from "@/components/ui";
import { AudioLibrary } from "./library";
import { STATS } from "@/lib/data";
import { getLectures } from "@/lib/cms/library";

export const revalidate = 300;
export const metadata = { title: "Audio lectures" };

export default async function Page() {
  const cms = await cmsOverride('/teachings/audio'); if (cms) return cms;
  const lectures = await getLectures();
  return <Original lectures={lectures} />;
}

function Original({ lectures }: { lectures: Awaited<ReturnType<typeof getLectures>> }) {
  const n = lectures?.length ?? STATS.lectures;
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Audio lectures" }]} icon={Headphones} title="Audio lectures"
        intro={`${n.toLocaleString()} recorded lectures from 1985 to 1996, remastered. Combine any filters, press play, and keep browsing: the player stays with you.`} />
      <AudioLibrary lectures={lectures ?? undefined} />
    </>
  );
}
