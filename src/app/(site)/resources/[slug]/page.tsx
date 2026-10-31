import { SectionPage } from "@/components/sections";
import { MENUS } from "@/lib/nav";
import { CmsPage, cmsMetadata, hasCms } from "@/lib/cms/render";
import { CalendarView } from "@/components/cms/calendar-view";
import { PageHero } from "@/components/ui";
import { CalendarDays } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
import { RESOURCES, SITE_UPDATES } from "@/lib/resources";
import { ResourceView, PlainHeader } from "@/components/resources/view";
import Link from "next/link";
export const revalidate = 300;

export function generateStaticParams() {
  return MENUS.flatMap((m) => m.groups.flatMap((g) => g.links)).map((l) => l.href).filter((h) => h.startsWith("/resources/") && h.split("/").length === 3).map((h) => ({ slug: h.split("/")[2] }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const r = RESOURCES[slug]; if (r) return { title: r.title, description: r.intro }; if (slug === "vaishnava-calendar") return { title: "Gurudeva calendar" }; return cmsMetadata(["resources", slug]); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (await hasCms(["resources", slug])) return <CmsPage segments={["resources", slug]} />;
  if (RESOURCES[slug]) return <ResourceView p={RESOURCES[slug]} />;
  if (["updates", "announcements", "news", "programmes"].includes(slug)) {
    const rows = hasDb() ? ((await sql`select title, body, cta_label, cta_url, to_char(coalesce(starts_at, created_at), 'YYYY-MM-DD') as date, kind from announcements where active order by coalesce(starts_at, created_at) desc limit 100`.catch(() => [])) as any[]) : [];
    const head: Record<string, [string, string]> = { updates: ["Taptajīvanam updates", "What is new on the website."], announcements: ["Announcements", "Notices for everyone."], news: ["News & information", "From the mission of Śrīla Gurudeva and Taptajīvanam."], programmes: ["Programmes & schedules", "Festivals, classes and events."] };
    const items = [...rows.map((r) => ({ date: r.date, title: r.title, text: String(r.body || "").replace(/<[^>]+>/g, " "), href: r.cta_url || undefined })), ...(slug === "updates" ? SITE_UPDATES : [])];
    return (
      <div className="bg-white">
        <PlainHeader kicker="Resources" title={head[slug][0]} intro={head[slug][1]} />
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6">
          {!items.length && <p className="py-12 text-center text-[13.5px] text-ink-3">Nothing here yet. New notices are added in Studio › Announcements.</p>}
          <ol className="relative border-l border-line">{items.map((u, i) => <li key={i} className="relative mb-6 pl-6 last:mb-0"><span className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-ink" /><p className="text-[12px] tabular-nums text-ink-3">{u.date ? new Date(u.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}</p><p className="mt-0.5 text-[15.5px] font-medium text-ink">{u.title}</p><p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{u.text}</p>{u.href && <Link href={u.href} className="mt-1.5 inline-block text-[13px] text-ink underline underline-offset-2">Open</Link>}</li>)}</ol>
        </div>
      </div>
    );
  }
  if (slug === "vaishnava-calendar" && hasDb()) {
    const ev = await sql`select to_char(date, 'YYYY-MM-DD') as date, title, kind, fasting, paran, description, location, link from calendar_events where status = 'published' and date >= now() - interval '400 days' and date <= now() + interval '800 days' order by date`.catch(() => []);
    if (ev.length) return <><PageHero crumbs={[]} icon={CalendarDays} title="Gurudeva calendar" intro="Festivals, Ekādaśīs, and the appearance and disappearance days of the ācāryas." /><CalendarView events={ev as any} /></>;
  }
  return <SectionPage href={`/resources/${slug}`} />;
}
