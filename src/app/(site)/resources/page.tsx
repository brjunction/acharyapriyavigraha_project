import { cmsOverride } from "@/lib/cms/render";
import { MenuHub } from "@/components/sections";

export const metadata = { title: "Resources" };

export default async function Page() {
  const cms = await cmsOverride('/resources'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return <MenuHub menuKey="resources" />;
}
