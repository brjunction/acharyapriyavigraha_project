import { redirect } from "next/navigation";
import { cmsOverride } from "@/lib/cms/render";

export const metadata = { title: "Resources" };

// Resources was folded into About (tools, downloads, elsewhere online, news) and the Paramparā menu; the old address keeps working.
export default async function Page() {
  const cms = await cmsOverride("/resources"); if (cms) return cms;
  redirect("/about");
}
