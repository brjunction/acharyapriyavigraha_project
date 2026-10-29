import { ItemPage } from "@/components/cms/collection";
export const revalidate = 300;
export default async function Page({ params }: { params: Promise<{ slug: string; item: string }> }) { const { slug, item } = await params; return <ItemPage route={`/teachings/${slug}`} slug={item} />; }
