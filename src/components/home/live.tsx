"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CONVERSATION, LETTER } from "@/lib/prabhupada";

/** Numbers that count up once when they come into view. */
export function LiveNumbers({ items }: { items: { n: number; label: string; sub: string }[] }) {
  const ref = useRef<HTMLDivElement>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, []);
  return (
    <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((x) => <Num key={x.label} {...x} on={on} />)}
    </div>
  );
}
function Num({ n, label, sub, on }: { n: number; label: string; sub: string; on: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => { if (!on) return; const t0 = performance.now(); let raf = 0; const f = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [on, n]);
  return (
    <div className="rounded-2xl border border-[#eadcc0] bg-white px-4 py-5 text-center">
      <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[32px]">{v.toLocaleString()}</p>
      <p className="mt-2 text-[13.5px] font-medium text-saffron">{label}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{sub}</p>
    </div>
  );
}

const hl = (t: string) => t.split(/«|»/).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-[#fbf0d2] px-0.5 font-medium text-ink">{p}</mark> : p));
/** The two sources side by side, each opening to the full text. */
export function BlessingLetters() {
  const [open, setOpen] = useState<string | null>(null);
  const card = "relative rounded-2xl border border-[#eadcc0] bg-white p-6 shadow-[0_20px_40px_-30px_rgba(120,60,10,0.4)] before:absolute before:inset-x-8 before:top-0 before:h-[3px] before:rounded-b before:bg-gradient-to-r before:from-[#e8c766] before:via-[#c2621d] before:to-[#e8c766]";
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <figure className={card}>
        <div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/legacy/prabhupada.webp" alt="" className="size-12 rounded-full border border-[#eadcc0] object-cover object-top" /><div><p className="text-[14px] font-semibold text-ink">{CONVERSATION.title.split(",")[0]}</p><p className="text-[12px] text-ink-3">{CONVERSATION.title.split(",").slice(1).join(",").trim()}</p></div></div>
        <blockquote className="mt-5 text-[15.5px] leading-relaxed text-ink-2">{hl(CONVERSATION.lines.find(([, l]) => l.includes("«"))?.[1].slice(0, 220) + "…")}</blockquote>
        <button onClick={() => setOpen(open === "c" ? null : "c")} className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">{open === "c" ? "Hide" : "Read the conversation"}<ChevronDown size={14} className={open === "c" ? "rotate-180" : ""} /></button>
        {open === "c" && <div className="mt-3 max-h-[320px] overflow-y-auto rounded-xl border border-[#f1e7d4] bg-[#fbf7ef]">{CONVERSATION.lines.map(([w, l], i) => <p key={i} className="border-b border-[#f1e7d4] px-4 py-2 text-[13px] leading-relaxed text-ink-2 last:border-0"><span className={`mr-1.5 font-semibold ${w === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{w}:</span>{hl(l)}</p>)}</div>}
      </figure>
      <figure className={card}>
        <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-[18px]" style={{ fontFamily: "var(--font-reading-serif)" }}>✉</span><div><p className="text-[14px] font-semibold text-ink">{LETTER.title.split(",")[0]}</p><p className="text-[12px] text-ink-3">{LETTER.title.split(",").slice(1).join(",").trim()}</p></div></div>
        <blockquote className="mt-5 text-[15.5px] leading-relaxed text-ink-2">{hl(LETTER.paras[1])}</blockquote>
        <button onClick={() => setOpen(open === "l" ? null : "l")} className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">{open === "l" ? "Hide" : "Read the letter"}<ChevronDown size={14} className={open === "l" ? "rotate-180" : ""} /></button>
        {open === "l" && <div className="mt-3 max-h-[320px] space-y-2.5 overflow-y-auto rounded-xl border border-[#f1e7d4] bg-[#fbf7ef] p-4 text-[13px] leading-relaxed text-ink-2"><p>{LETTER.salutation}</p>{LETTER.paras.map((p, i) => <p key={i}>{hl(p)}</p>)}<p className="text-ink-3">{LETTER.closing[0]}<br />{LETTER.closing[1]}</p></div>}
      </figure>
    </div>
  );
}

/** Topics as chips sized by how much is on them. */
export function TopicCloud({ topics }: { topics: { name: string; slug: string; total: number }[] }) {
  const max = Math.max(1, ...topics.map((t) => t.total));
  if (!topics.length) return <p className="py-8 text-center text-[13px] text-ink-3">Topics appear here as they are added in the Studio.</p>;
  return (
    <div className="flex flex-wrap gap-2">{topics.map((t) => { const w = t.total / max; return (
      <Link key={t.slug} href={`/tattva/${t.slug}`} className="rounded-full border border-[#eadcc0] px-3 py-1.5 text-ink-2 transition hover:border-saffron hover:bg-[#fbf7ef] hover:text-saffron" style={{ fontSize: 12.5 + w * 3 }}>{t.name}{t.total > 0 && <span className="ml-1.5 text-[11px] text-ink-3">{t.total}</span>}</Link>); })}</div>
  );
}
