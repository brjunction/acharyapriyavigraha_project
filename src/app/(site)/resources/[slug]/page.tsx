import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CalendarView } from "@/components/cms/calendar-view";
import { PageHero } from "@/components/ui";
import { CalendarDays } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
export const revalidate = 300;

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/resources/") && h.split("/").length === 3).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return cmsMetadata(["resources", slug]); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (await hasCms(["resources", slug])) return <CmsPage segments={["resources", slug]} />;
  if (slug === "vaishnava-calendar" && hasDb()) {
    const ev = await sql`select to_char(date, 'YYYY-MM-DD') as date, title, kind, fasting, paran, description, location, link from calendar_events where status = 'published' and date >= now() - interval '400 days' and date <= now() + interval '800 days' order by date`.catch(() => []);
    if (ev.length) return <><PageHero crumbs={[{ href: "/resources", label: "Resources" }, { label: "Vaiṣṇava calendar" }]} icon={CalendarDays} title="Vaiṣṇava calendar" intro="Festivals, Ekādaśīs, and the appearance and disappearance days of the ācāryas." /><CalendarView events={ev as any} /></>;
  }
  return <SectionPage href={`/resources/${slug}`} />;
}
