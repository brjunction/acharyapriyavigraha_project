import Link from "next/link";
import { notFound } from "next/navigation";
import { nav, groupPage } from "@/lib/webfolio/data";
import { FolioArticle, Plain, Doc } from "@/components/webfolio/article";

export const revalidate = 600;
export async function generateMetadata({ params }: { params: Promise<{ sec: string; group: string }> }) { const { sec, group } = await params; const p = await groupPage(sec, decodeURIComponent(group)); return p ? { title: p.title, description: p.intro } : {}; }
/** One group on one scrollable page: a year of lectures, a whole book, all the quotes, a year of the diary… */
export default async function Group({ params }: { params: Promise<{ sec: string; group: string }> }) {
  const { sec, group: g0 } = await params; const group = decodeURIComponent(g0);
  const [n, p] = await Promise.all([nav(), groupPage(sec, group)]); const s = n.find((x) => x.key === sec); if (!s || !p) notFound();
  const all = n.flatMap((x) => x.groups.map((y) => ({ title: y.title, href: `/webfolio/${x.key}/${y.key}` }))); const k = all.findIndex((x) => x.href === `/webfolio/${sec}/${group}`);
  return (
    <FolioArticle crumbs={[{ href: "/webfolio", label: "WebFolio" }, { href: `/webfolio/${sec}`, label: s.title }, { label: p.title.replace(`${s.title} · `, "") }]} title={p.title} sub={p.sub} intro={p.intro} prev={all[k - 1] || null} next={all[k + 1] || null}>
      {!p.blocks.length ? <p className="text-[14px] text-zinc-500">Nothing here yet.</p> : p.list ? (
        <ul className="divide-y divide-zinc-100 border-y border-zinc-100">{p.blocks.map((b) => <li key={b.id}><Link href={b.href!} className="group flex items-center gap-4 py-3"><span className="min-w-0 flex-1"><span className="block text-[14.5px] font-medium text-zinc-900 group-hover:text-[#853500]">{b.title}</span>{b.sub && <span className="mt-0.5 block truncate text-[12.5px] text-zinc-500">{b.sub}</span>}</span>{b.badge && <span className="rounded border border-zinc-200 px-1.5 text-[11px] text-zinc-500">{b.badge}</span>}</Link></li>)}</ul>
      ) : (
        <div className="space-y-12">{p.blocks.map((b) => <section key={b.id} className="scroll-mt-20">
          {b.title && <h2 id={b.id} className="scroll-mt-20 text-[20px] font-semibold tracking-tight text-zinc-950">{b.href ? <Link href={b.href} className="hover:text-[#853500]">{b.title}</Link> : b.title}</h2>}
          {b.sub && <p className="mt-1 text-[12.5px] text-zinc-500">{b.sub}</p>}
          {b.text && <div className="mt-4"><Plain text={b.text} /></div>}
          {b.doc && b.doc.length > 0 && <div className="mt-4"><Doc doc={b.doc} /></div>}
        </section>)}</div>
      )}
    </FolioArticle>
  );
}
