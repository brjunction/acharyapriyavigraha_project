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
      <p className="text-[24px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[32px]">{v.toLocaleString()}</p>
      <p className="mt-2 text-[13.5px] font-medium text-saffron">{label}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{sub}</p>
    </div>
  );
}

const hl = (t: string) => t.split(/«|»/).map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-[#fbf0d2] px-0.5 font-medium text-ink">{p}</mark> : p));
/** Two quiet links that open the full conversation or the full letter in a large reading window. */
export function BlessingLetters() {
  const [open, setOpen] = useState<"c" | "l" | null>(null);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null); window.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [open]);
  const link = "inline-flex items-center gap-1.5 rounded-full border border-[#e6d6b8] bg-white/70 px-4 py-2 text-[13px] text-ink transition hover:border-saffron hover:text-saffron";
  return (
    <>
      <div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => setOpen("c")} className={link}>Read the conversation</button><button onClick={() => setOpen("l")} className={link}>Read the letter</button></div>
      {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-8" onClick={() => setOpen(null)}>
        <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#fffdf8] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 border-b border-[#efe4cf] px-6 py-4 sm:px-8">
            <div><p className="text-[11px] font-medium uppercase tracking-[0.25em] text-saffron">Śrīla Prabhupāda on Śrīla Gurudeva</p><p className="mt-1 text-[17px] font-semibold text-ink sm:text-[19px]">{open === "c" ? CONVERSATION.title : LETTER.title}</p><p className="text-[12.5px] text-ink-3">{open === "c" ? CONVERSATION.speakers : `Letter ${LETTER.ref}`}</p></div>
            <button onClick={() => setOpen(null)} className="rounded-md px-2 py-1 text-[22px] leading-none text-ink-3 hover:bg-black/5" aria-label="Close">×</button>
          </div>
          <div className="overflow-y-auto px-6 py-6 text-[15.5px] leading-[1.8] text-ink-2 sm:px-10 sm:text-[17px]" style={{ fontFamily: "var(--font-reading-serif)" }}>
            {open === "c" ? CONVERSATION.lines.map(([w, l], i) => <p key={i} className="mb-3"><span className={`mr-2 font-sans text-[13px] font-semibold ${w === "Prabhupāda" ? "text-saffron" : "text-ink"}`}>{w}</span>{hl(l)}</p>)
              : <><p className="mb-4">{LETTER.salutation}</p>{LETTER.paras.map((p, i) => <p key={i} className="mb-4">{hl(p)}</p>)}<p className="mt-6 text-ink-3">{LETTER.closing[0]}<br />{LETTER.closing[1]}</p></>}
          </div>
        </div>
      </div>}
    </>
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
