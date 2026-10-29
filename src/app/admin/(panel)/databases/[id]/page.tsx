import { DatabaseEditor } from "@/components/admin/notion/database";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DatabaseEditor id={id} />; }
