import Link from "next/link";
import { notFound } from "next/navigation";
import { nav } from "@/lib/webfolio/data";
import { FolioArticle } from "@/components/webfolio/article";

export const revalidate = 600;
export async function generateMetadata({ params }: { params: Promise<{ sec: string }> }) { const { sec } = await params; const s = (await nav()).find((x) => x.key === sec); return s ? { title: s.title, description: s.desc } : {}; }
export default async function Section({ params }: { params: Promise<{ sec: string }> }) {
  const { sec } = await params; const n = await nav(); const k = n.findIndex((x) => x.key === sec); const s = n[k]; if (!s) notFound();
  return (
    <FolioArticle crumbs={[{ href: "/webfolio", label: "WebFolio" }, { label: s.title }]} title={s.title} intro={s.desc + "."} prev={n[k - 1] ? { title: n[k - 1].title, href: `/webfolio/${n[k - 1].key}` } : null} next={s.groups[0] ? { title: s.groups[0].title, href: `/webfolio/${sec}/${s.groups[0].key}` } : null}>
      <div className="grid gap-3 sm:grid-cols-2">{s.groups.map((g) => <Link key={g.key} href={`/webfolio/${sec}/${g.key}`} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3.5 transition hover:border-zinc-300 hover:shadow-sm"><span className="text-[14.5px] font-medium text-zinc-900">{g.title}</span>{g.count ? <span className="text-[12px] tabular-nums text-zinc-400">{g.count.toLocaleString()}</span> : null}</Link>)}</div>
    </FolioArticle>
  );
}
