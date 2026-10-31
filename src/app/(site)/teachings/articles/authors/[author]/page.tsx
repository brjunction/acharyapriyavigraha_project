import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { allAuthors, allArticles } from "@/lib/content/articles-public";
import { WritingsHeader, Avatar } from "@/components/articles/header";

export const revalidate = 300;
const find = async (slug: string) => (await allAuthors()).find((a) => a.slug === slug);
export async function generateMetadata({ params }: { params: Promise<{ author: string }> }) { const a = await find((await params).author); return a ? { title: `${a.name} · Articles`, description: a.bio || `Articles by ${a.name}.` } : {}; }

export default async function Page({ params }: { params: Promise<{ author: string }> }) {
  const a = await find((await params).author); if (!a) notFound();
  const list = (await allArticles()).filter((x) => x.author === a.name);
  const series = Array.from(new Set(list.map((x) => x.series).filter(Boolean))) as string[];
  return (
    <>
      <WritingsHeader at="/teachings/articles/authors" title={a.name} intro={a.role || "Author"} stats={[`${list.length} ${list.length === 1 ? "article" : "articles"}`]} crumbs={[["/teachings/articles", "Articles"], ["/teachings/articles/authors", "Authors"]]} />
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><Avatar name={a.name} photo={a.photo} size={120} />{a.bio && <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">{a.bio}</p>}{series.length > 0 && <div className="mt-6"><p className="mb-2 text-[12px] font-medium text-ink-3">Series</p>{series.map((s) => <Link key={s} href={`/teachings/articles?series=${encodeURIComponent(s)}`} className="block rounded-md px-2 py-1.5 text-[13px] text-ink-2 hover:bg-band">{s}</Link>)}</div>}</aside>
        <div className="divide-y divide-line border-y border-line">{list.map((x) => (
          <Link key={x.slug} href={`/teachings/articles/${x.slug}`} className="group block py-5">
            <p className="text-[12px] text-ink-3">{[x.section, x.series && `${x.series}${x.series_part ? `, part ${x.series_part}` : ""}`].filter(Boolean).join(" · ")}</p>
            <h2 className="mt-0.5 text-[18px] font-semibold leading-snug text-ink group-hover:underline" style={{ fontFamily: "var(--font-reading-serif)" }}>{x.title}</h2>
            {x.summary && <p className="mt-1 line-clamp-2 text-[14px] text-ink-2">{x.summary}</p>}
            <p className="mt-2 flex items-center gap-3 text-[12px] text-ink-3">{x.date && <span>{x.date}</span>}<span className="flex items-center gap-1"><Clock size={12} />{x.minutes} min read</span></p>
          </Link>))}</div>
      </div>
    </>
  );
}
