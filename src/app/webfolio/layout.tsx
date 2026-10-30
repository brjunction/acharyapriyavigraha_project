import type { Metadata } from "next";
import { nav } from "@/lib/webfolio/data";
import { FolioFrame } from "@/components/webfolio/frame";
import { RegisterSW } from "@/components/webfolio/offline";

export const metadata: Metadata = { title: { default: "WebFolio", template: "%s · WebFolio" }, manifest: "/webfolio/manifest.webmanifest", appleWebApp: { capable: true, title: "WebFolio" }, description: "The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva as one searchable book: lectures, transcriptions, books, compilations and his diary." };
export default async function Layout({ children }: { children: React.ReactNode }) { return <FolioFrame nav={await nav()}><RegisterSW />{children}</FolioFrame>; }
