import { NestedPage } from "@/lib/cms/render";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ rest: string[] }> }) { const { rest } = await params; return <NestedPage segments={["about", "founder", ...rest]} />; }
