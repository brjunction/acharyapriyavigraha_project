import Link from "next/link";
import { topics, childrenOf } from "@/lib/content/topics";
import { fold } from "@/lib/content/text";

export const metadata = { title: "Tattva", description: "The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva by subject: quotes, lectures, videos and articles on each tattva." };
export const revalidate = 300;

export default async function Page() {
  const all = await topics(); const top = childrenOf(all, null).filter((t) => !t.parent || !all.some((x) => x.name === t.parent));
  const groups = all.reduce<Record<string, typeof all>>((a, t) => { const L = fold(t.name)[0]?.toUpperCase() || "#"; (a[/[A-Z]/.test(L) ? L : "#"] ||= []).push(t); return a; }, {});
  return (
    <div>
            <h1 className="mt-1 text-[24px] leading-tight text-ink sm:text-[26px]">Tattva</h1>
      <p className="mt-1 max-w-2xl text-[13.5px] text-ink-2">Every subject he spoke on. Open a topic to see his quotes, lectures, videos and articles on it together.</p>
      {!all.length && <p className="mt-10 text-[13.5px] text-ink-3">Topics will appear here once they are added in the Studio.</p>}
      {top.length > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{top.map((t) => { const ch = childrenOf(all, t.name); return (
        <div key={t.name} className="rounded-lg border border-line p-4 transition hover:border-line-strong">
          <Link href={`/tattva/${t.slug}`} className="flex items-baseline justify-between gap-2"><span className="text-[14.5px] font-medium text-ink hover:underline">{t.name}</span>{t.total > 0 && <span className="text-[11.5px] text-ink-3">{t.total}</span>}</Link>
          {t.description && <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-3">{t.description}</p>}
          {ch.length > 0 && <div className="mt-2.5 flex flex-wrap gap-1">{ch.slice(0, 8).map((c) => <Link key={c.name} href={`/tattva/${c.slug}`} className="rounded bg-band px-1.5 py-0.5 text-[11.5px] text-ink-2 hover:bg-line">{c.name}</Link>)}{ch.length > 8 && <span className="px-1 text-[11.5px] text-ink-3">+{ch.length - 8}</span>}</div>}
        </div>); })}</div>}
      {all.length > 0 && <>
        <div className="mt-10 flex items-baseline justify-between border-b border-line pb-2"><h2 className="text-[14px] font-semibold text-ink">All topics, A–Z</h2><span className="text-[12px] text-ink-3">{all.length}</span></div>
        <div className="sticky top-[52px] z-10 flex flex-wrap gap-0.5 bg-white/95 py-2 backdrop-blur sm:top-[58px]">{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((L) => groups[L] ? <a key={L} href={`#l-${L}`} className="flex size-7 items-center justify-center rounded text-[12.5px] text-ink-2 hover:bg-band">{L}</a> : <span key={L} className="flex size-7 items-center justify-center text-[12.5px] text-ink-3/40">{L}</span>)}</div>
        <div className="mt-2 columns-1 gap-8 sm:columns-2 lg:columns-3">{Object.keys(groups).sort().map((L) => (
          <div key={L} id={`l-${L}`} className="mb-5 scroll-mt-28 break-inside-avoid"><p className="mb-1 text-[12px] font-semibold text-ink-3">{L}</p>{groups[L].map((t) => <Link key={t.name} href={`/tattva/${t.slug}`} className="flex justify-between rounded px-1.5 py-1 text-[13px] text-ink-2 hover:bg-band hover:text-ink"><span>{t.name}</span><span className="text-[11.5px] text-ink-3">{t.total || ""}</span></Link>)}</div>
        ))}</div>
      </>}
    </div>
  );
}
