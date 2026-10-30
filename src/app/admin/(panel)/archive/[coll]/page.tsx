import { notFound } from "next/navigation";
import { COLLECTIONS } from "@/lib/archive/config";
import { ArchivePanel } from "@/components/admin/archive/panel";

export default async function Page({ params }: { params: Promise<{ coll: string }> }) { const { coll } = await params; if (!COLLECTIONS[coll]) notFound(); return <ArchivePanel coll={coll} />; }
