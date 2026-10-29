import { NotionPage } from "@/components/admin/notion/page";
export default async function Edit({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <NotionPage pageId={id} />; }
