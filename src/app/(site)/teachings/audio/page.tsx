import { cmsOverride } from "@/lib/cms/render";
import { Headphones } from "lucide-react";
import { PageHero } from "@/components/ui";
import { AudioLibrary } from "./library";
import { STATS } from "@/lib/data";

export const metadata = { title: "Audio lectures" };

export default async function Page() {
  const cms = await cmsOverride('/teachings/audio'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Audio lectures" }]} icon={Headphones} title="Audio lectures"
        intro={`${STATS.lectures.toLocaleString()} recorded lectures from 1985 to 1996, remastered. Combine any filters, press play, and keep browsing: the player stays with you.`} />
      <AudioLibrary />
    </>
  );
}
