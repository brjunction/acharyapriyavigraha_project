import type { Metadata } from "next";
import { Toaster } from "@/components/admin/ui";
export const metadata: Metadata = { title: "Taptajivanam Studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AdminRoot({ children }: { children: React.ReactNode }) { return <div className="admin min-h-screen bg-white antialiased">{children}<Toaster /></div>; }
