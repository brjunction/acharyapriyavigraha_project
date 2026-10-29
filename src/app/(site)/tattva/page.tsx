import { cmsOverride } from "@/lib/cms/render";
import { MenuHub } from "@/components/sections";
import { Container } from "@/components/ui";
import { TopicExplorer } from "@/components/topic-explorer";

export const metadata = { title: "Tattva" };

export default async function Page() {
  const cms = await cmsOverride('/tattva'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return <MenuHub menuKey="tattva" before={<Container className="pt-12"><TopicExplorer /></Container>} />;
}
