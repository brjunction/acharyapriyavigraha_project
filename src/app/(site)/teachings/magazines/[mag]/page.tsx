import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazine } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { MagCover } from "@/components/articles/mag-cover";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ mag: string }> }) { const r = await getMagazine((await params).mag); return r ? { title: r.magazine.title, description: r.magazine.description || `All issues of ${r.magazine.title}.` } : {}; }

/** One magazine: every issue, by year. */
export default async function Page({ params }: { params: Promise<{ mag: string }> }) {
  const r = await getMagazine((await params).mag); if (!r) notFound();
  const { magazine: m, issues } = r;
  const years = Array.from(new Set(issues.map((i: any) => i.year || 0))).sort((a: any, b: any) => b - a) as number[];
  return (
    <>
      <WritingsHeader at="/teachings/magazines" title={m.title} intro={m.description || m.publisher || "All issues"} stats={[`${issues.length} issues`, `${issues.reduce((n: number, i: any) => n + i.n, 0)} articles`]} crumbs={[["/teachings/magazines", "Magazines"]]} />
      <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        {years.length > 1 && <nav className="sticky top-[52px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur [scrollbar-width:none] sm:top-[58px] sm:-mx-6 sm:px-6">{years.map((y) => <a key={y} href={`#y-${y}`} className="shrink-0 rounded-md px-2.5 py-1 text-[13px] tabular-nums text-ink-2 hover:bg-band">{y || "Undated"}</a>)}</nav>}
        {!issues.length && <p className="py-20 text-center text-[13.5px] text-ink-3">Issues will appear here soon.</p>}
        {years.map((y) => (
          <section key={y} id={`y-${y}`} className="scroll-mt-32 pt-8">
            <h2 className="mb-5 flex items-baseline gap-2 border-b border-line pb-2 text-[15px] font-semibold tabular-nums text-ink">{y || "Undated"}<span className="text-[12px] font-normal text-ink-3">{issues.filter((i: any) => (i.year || 0) === y).length}</span></h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">{issues.filter((i: any) => (i.year || 0) === y).map((i: any) => (
              <Link key={i.slug} href={`/teachings/magazines/${m.slug}/${i.slug}`} className="group"><MagCover src={i.cover} label={i.title || i.number} className="transition group-hover:-translate-y-0.5" />
                <span className="mt-2 block text-[13.5px] font-medium leading-snug text-ink group-hover:underline">{i.number && i.title ? `${i.number} · ${i.title}` : i.title || i.number}</span>
                <span className="block text-[12px] text-ink-3">{[i.date ? new Date(i.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null, i.n ? `${i.n} articles` : null].filter(Boolean).join(" · ")}</span></Link>))}</div>
          </section>))}
      </div>
    </>
  );
}
