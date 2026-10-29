import { ItemPage } from "@/components/cms/collection";
export const revalidate = 300;
export default async function Page({ params }: { params: Promise<{ item: string }> }) { const { item } = await params; return <ItemPage route="/teachings/quotes" slug={item} />; }
