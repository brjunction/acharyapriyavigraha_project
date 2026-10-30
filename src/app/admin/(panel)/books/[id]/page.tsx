import { BookEditor } from "@/components/admin/content/book-editor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BookEditor id={id} />; }
