import { NestedPage } from "@/lib/cms/render";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string; rest: string[] }> }) { const { slug, rest } = await params; return <NestedPage segments={["about", slug, ...rest]} />; }
