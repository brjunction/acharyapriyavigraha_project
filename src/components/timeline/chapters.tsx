"use client";
/* The life timeline's default view: one calm page. A bar of chapters stays on top while reading; "Sections" opens the
   whole life at a glance (every chapter, its years and moments) and jumps to any of them. Moments fade in gently
   as they come into view. Search and the other layouts stay under "Search & more views". */
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutList, X, MapPin, Users, Search } from "lucide-react";
import { kindOf, when, eraOf, type Era, type LifeEvent } from "@/lib/content/timeline-shared";

type Chapter = { era: Era; events: LifeEvent[] };
const span = (e: Era) => (e.year_from === e.year_to ? `${e.year_from}` : `${e.year_from}–${e.year_to}`);

export function TimelineChapters({ eras, events, onMore }: { eras: Era[]; events: LifeEvent[]; onMore: () => void }) {
  const chapters: Chapter[] = useMemo(() => {
    const out = eras.map((era) => ({ era, events: events.filter((e) => eraOf(eras, e.year)?.id === era.id) })).filter((c) => c.events.length || c.era.summary);
    const loose = events.filter((e) => !eraOf(eras, e.year));
    if (loose.length) out.push({ era: { id: "other", title: "Other moments", subtitle: null, year_from: loose[0].year, year_to: loose[loose.length - 1].year, summary: null, image: null, position: 99 }, events: loose });
    return out;
  }, [eras, events]);
  const [on, setOn] = useState(0); const [panel, setPanel] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const places = new Set(events.map((e) => e.place).filter(Boolean)).size;

  // Which chapter is being read; and the gentle fade-in of each moment.
  useEffect(() => {
    const heads = Array.from(document.querySelectorAll<HTMLElement>("[data-ch]"));
    const io = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) setOn(Number((x.target as HTMLElement).dataset.ch)); }), { rootMargin: "-25% 0px -65% 0px" });
    heads.forEach((h) => io.observe(h));
    const items = Array.from(document.querySelectorAll<HTMLElement>(".tlc-in"));
    const fade = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("tlc-seen"); fade.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
    items.forEach((i) => fade.observe(i));
    return () => { io.disconnect(); fade.disconnect(); };
  }, [chapters]);
  // Keep the current chapter's chip in sight in the bar.
  useEffect(() => { bar.current?.querySelector<HTMLElement>(`[data-chip="${on}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }, [on]);
  useEffect(() => { if (!panel) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setPanel(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [panel]);

  const jump = (id: string) => { setPanel(false); const el = document.getElementById(id); if (!el) return; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 128, behavior: "smooth" }); };

  if (!events.length) return <p className="py-20 text-center text-[15px] text-ink-3">The moments of his life are being added.</p>;
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-[1100px] px-5 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
          <div>
            <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[36px]">His life, year by year</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">The life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva in {chapters.length} chapters: {events.length} moments{places ? `, in ${places} places` : ""}.</p>
          </div>
          <button onClick={onMore} className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[13.5px] font-medium text-ink-2 transition hover:border-ink hover:text-ink"><Search size={15} />Search & more views</button>
        </div>
      </section>

      {/* The chapter bar */}
      <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-5 py-2 sm:px-8">
          <button onClick={() => setPanel(true)} aria-haspopup="dialog" className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-[12.5px] font-medium text-white transition hover:bg-ink/85"><LayoutList size={14} />Sections</button>
          <div ref={bar} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {chapters.map((c, i) => (
              <button key={c.era.id} data-chip={i} onClick={() => jump(`ch-${i}`)} aria-current={on === i}
                className={`flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12.5px] transition ${on === i ? "bg-band font-medium text-ink ring-1 ring-line-strong" : "text-ink-2 hover:bg-band/70 hover:text-ink"}`}>
                {c.era.title}<span className="tabular-nums text-ink-3">{span(c.era)}</span>
              </button>))}
          </div>
        </div>
      </div>

      {/* Sections: the whole life at once */}
      {panel && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-3 pt-[72px] sm:p-6 sm:pt-[90px]" onMouseDown={(e) => e.target === e.currentTarget && setPanel(false)} role="dialog" aria-label="Sections of his life">
          <div className="tlc-panel max-h-[calc(100vh-110px)] w-full max-w-[920px] overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,.35)] sm:p-6">
            <div className="mb-4 flex items-center justify-between"><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">The whole life</p><button onClick={() => setPanel(false)} aria-label="Close" className="rounded-full p-1.5 text-ink-3 hover:bg-band hover:text-ink"><X size={16} /></button></div>
            <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {chapters.map((c, i) => (
                <li key={c.era.id} className="min-w-0">
                  <button onClick={() => jump(`ch-${i}`)} className="group flex w-full items-baseline gap-2 text-left">
                    <span className="w-5 shrink-0 text-[12px] tabular-nums text-ink-3">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-ink group-hover:underline">{c.era.title}</span>
                    <span className="shrink-0 text-[12px] tabular-nums text-ink-3">{span(c.era)}</span>
                  </button>
                  <ul className="mt-1.5 border-l border-line pl-3 ml-[7px]">
                    {c.events.map((e) => (
                      <li key={e.id}><button onClick={() => jump(`m-${e.slug}`)} className="flex w-full items-baseline gap-2 py-[3px] text-left text-[13px] text-ink-2 hover:text-ink">
                        <span className="w-[42px] shrink-0 tabular-nums text-ink-3">{e.year}</span><span className={`min-w-0 truncate ${e.importance === 1 ? "font-medium text-ink" : ""}`}>{e.title}</span></button></li>))}
                  </ul>
                </li>))}
            </ol>
          </div>
        </div>)}

      {/* The chapters */}
      <div className="mx-auto max-w-[1100px] px-5 pb-20 sm:px-8">
        {chapters.map((c, i) => (
          <section key={c.era.id} id={`ch-${i}`} data-ch={i} className="scroll-mt-32 border-b border-line py-10 last:border-0 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
              <header className="tlc-in lg:sticky lg:top-[140px] lg:self-start">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">Chapter {i + 1} · {span(c.era)}</p>
                <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[26px]">{c.era.title}</h2>
                {c.era.subtitle && <p className="mt-1 text-[13.5px] text-ink-3">{c.era.subtitle}</p>}
                {c.era.summary && <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{c.era.summary}</p>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.era.image && <img src={c.era.image} alt="" loading="lazy" className="mt-5 h-auto w-full max-w-[280px] rounded-xl border border-line" />}
              </header>
              <ol className="relative border-l border-line pl-6 sm:pl-8">
                {c.events.map((e) => { const k = kindOf(e.kind); return (
                  <li key={e.id} id={`m-${e.slug}`} className={`tlc-in relative scroll-mt-36 ${e.importance === 3 ? "py-2" : "py-4"}`}>
                    <span className="absolute -left-[29px] top-[22px] size-[9px] rounded-full ring-4 ring-white sm:-left-[37px]" style={{ background: k[2] }} aria-hidden />
                    <p className="text-[12.5px] tabular-nums text-ink-3">{when(e)}<span className="mx-1.5">·</span><span style={{ color: k[2] }}>{k[1]}</span></p>
                    <h3 className={`mt-0.5 leading-snug text-ink ${e.importance === 1 ? "text-[18px] font-semibold" : "text-[15.5px] font-medium"}`}>{e.title}</h3>
                    {e.importance !== 3 && e.summary && <p className="mt-1.5 max-w-[640px] text-[14.5px] leading-relaxed text-ink-2">{e.summary}</p>}
                    {e.importance !== 3 && (e.place || e.people.length > 0) && (
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-3">
                        {e.place && <span className="flex items-center gap-1"><MapPin size={13} />{[e.place, e.country].filter(Boolean).join(", ")}</span>}
                        {e.people.length > 0 && <span className="flex items-center gap-1"><Users size={13} />{e.people.join(", ")}</span>}
                      </p>)}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e.image && e.importance === 1 && <figure className="mt-4 max-w-[520px]"><img src={e.image} alt={e.image_caption || ""} loading="lazy" className="h-auto w-full rounded-xl border border-line" />{e.image_caption && <figcaption className="mt-1.5 text-[12px] text-ink-3">{e.image_caption}</figcaption>}</figure>}
                  </li>); })}
              </ol>
            </div>
          </section>))}
      </div>
    </div>);
}
