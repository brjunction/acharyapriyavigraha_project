import { cmsOverride } from "@/lib/cms/render";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/ui";
import { TranscriptionBrowser } from "./browser";
import { STATS } from "@/lib/data";

export const metadata = { title: "Transcriptions" };

export default async function Page() {
  const cms = await cmsOverride('/teachings/transcriptions'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <>
      <PageHero crumbs={[{ href: "/teachings", label: "His Teachings" }, { label: "Transcriptions" }]} icon={FileText} title="Transcriptions"
        intro={`${STATS.transcriptions} lectures so far are available as text. Choose a year and month, or narrow by type, topic, place and language.`} bg="cream-mandala" flip />
      <TranscriptionBrowser />
    </>
  );
}
