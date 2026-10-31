import { HomePage } from "@/components/home/home-page";
export const metadata = { title: "Home — preview", robots: { index: false, follow: false } };
/** Preview the home page with another design of “Kṛṣṇa sent him”: /home-new?blessing=b */
export default async function Preview({ searchParams }: { searchParams: Promise<{ blessing?: string }> }) { const { blessing } = await searchParams; return <HomePage blessing={blessing || "a"} />; }
