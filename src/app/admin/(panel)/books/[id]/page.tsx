import { BookEditor } from "@/components/admin/content/books";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BookEditor id={id} />; }
