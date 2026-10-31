import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { RPage, RLink } from "@/lib/resources";

/** A plain title block used across Resources and About. */
export function PlainHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-8 sm:px-6">
        <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px]">{kicker}</p>
        <h1 className="text-[24px] leading-tight text-ink sm:text-[28px]">{title}</h1>
        {intro && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2 sm:text-[14.5px]">{intro}</p>}
      </div>
    </div>
  );
}
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
function Card({ l }: { l: RLink }) {
  const ext = /^https?:/.test(l.url); const inner = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">{ext ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(l.url)}`} alt="" className="size-5" /> : <ArrowRight size={16} className="text-ink-3" />}</span>
      <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[14.5px] font-medium text-ink group-hover:underline">{l.title}</span>{l.tag && <span className="rounded bg-band px-1.5 py-px text-[10.5px] text-ink-3">{l.tag}</span>}{l.soon && <span className="rounded bg-[#fbf0d2] px-1.5 py-px text-[10.5px] font-medium text-[#8a5a00]">Coming soon</span>}</span><span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{l.desc}</span>{ext && <span className="mt-1 block text-[11.5px] text-ink-3">{host(l.url)}</span>}</span>
      {ext ? <ArrowUpRight size={15} className="shrink-0 text-ink-3" /> : null}
    </>);
  const cls = `group flex items-start gap-4 rounded-xl border border-line p-4 transition ${l.soon ? "opacity-70" : "hover:border-line-strong hover:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.35)]"}`;
  if (l.soon) return <div className={cls}>{inner}</div>;
  return ext ? <a href={l.url} target="_blank" rel="noreferrer" className={cls}>{inner}</a> : <Link href={l.url} className={cls}>{inner}</Link>;
}
export function ResourceView({ p, kicker = "Resources" }: { p: RPage; kicker?: string }) {
  return (
    <div className="bg-white">
      <PlainHeader kicker={kicker} title={p.title} intro={p.intro} />
      <div className="mx-auto max-w-[1100px] space-y-10 px-4 py-8 sm:px-6">
        {p.groups.map((g, i) => <section key={i}>{g.title && <h2 className="mb-3 text-[14px] font-semibold text-ink">{g.title}</h2>}<div className="grid gap-3 sm:grid-cols-2">{g.links.map((l) => <Card key={l.title + l.url} l={l} />)}</div></section>)}
        {p.note && <p className="rounded-lg bg-band/60 p-4 text-[13px] leading-relaxed text-ink-2">{p.note}</p>}
      </div>
    </div>
  );
}
