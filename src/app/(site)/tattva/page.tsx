import { MenuHub } from "@/components/sections";
import { Container } from "@/components/ui";
import { TopicExplorer } from "@/components/topic-explorer";

export const metadata = { title: "Tattva" };

export default function Page() {
  return <MenuHub menuKey="tattva" before={<Container className="pt-12"><TopicExplorer /></Container>} />;
}
