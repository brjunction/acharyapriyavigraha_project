"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Link2, Check, MapPin, Users, Headphones, ChevronDown, Sparkles, Rows3, CalendarRange, X } from "lucide-react";
import { KINDS, kindOf, when, eraOf, type Era, type LifeEvent } from "@/lib/content/timeline-shared";

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const serif = { fontFamily: "var(--font-reading-serif)" } as const;
type View = "story" | "highlights" | "years";

export function LifeTimeline({ eras, events, recordings }: { eras: Era[]; events: LifeEvent[]; recordings: Record<number, number> }) {
  const [view, setView] = useState<View>("story"); const [q, setQ] = useState(""); const [kinds, setKinds] = useState<string[]>([]);
  const [activeEra, setActiveEra] = useState(0); const [activeYear, setActiveYear] = useState<number | null>(null); const [flash, setFlash] = useState<string | null>(null);

  const list = useMemo(() => {
    const w = fold(q.trim()).split(/\s+/).filter(Boolean);
    return events.filter((e) => (view !== "highlights" || e.importance === 1) && (!kinds.length || kinds.includes(e.kind)) &&
      (!w.length || w.every((x) => fold([e.title, e.summary, e.body, e.place, e.country, e.people.join(" "), String(e.year), e.date_label].filter(Boolean).join(" ")).includes(x))));
  }, [events, q, kinds, view]);

  // Chapters, each with its years, each year with its events.
  const chapters = useMemo(() => {
    const out = eras.map((era) => ({ era, events: list.filter((e) => eraOf(eras, e.year)?.id === era.id) }));
    const loose = list.filter((e) => !eraOf(eras, e.year));
    if (loose.length) out.push({ era: { id: "other", title: "Other moments", subtitle: null, year_from: loose[0].year, year_to: loose[loose.length - 1].year, summary: null, image: null, position: 99 }, events: loose });
    return out.map((c) => ({ ...c, years: Array.from(new Set(c.events.map((e) => e.year))).map((y) => ({ y, events: c.events.filter((e) => e.year === y) })) }));
  }, [eras, list]);
  const usedKinds = KINDS.filter(([k]) => events.some((e) => e.kind === k));
  const places = new Set(events.map((e) => e.place).filter(Boolean)).size;
  const years = Array.from(new Set(list.map((e) => e.year)));
  const maxRec = Math.max(1, ...Object.values(recordings));

  // Which chapter and year are on screen.
  useEffect(() => {
    if (view === "years") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-year],[data-era]"));
    const io = new IntersectionObserver((xs) => xs.forEach((x) => { if (!x.isIntersecting) return; const el = x.target as HTMLElement; if (el.dataset.era) setActiveEra(Number(el.dataset.era)); if (el.dataset.year) setActiveYear(Number(el.dataset.year)); }), { rootMargin: "-30% 0px -60% 0px" });
    els.forEach((el) => io.observe(el)); return () => io.disconnect();
  }, [chapters, view]);
  // Opening a shared link (#e-slug or #y-1975) scrolls to it and lights it up.
  useEffect(() => { const h = decodeURIComponent(location.hash.slice(1)); if (!h) return; setTimeout(() => go(h), 300); }, []); // eslint-disable-line
  const go = (id: string) => { const el = document.getElementById(id); if (!el) return; el.scrollIntoView({ behavior: "smooth", block: "center" }); if (id.startsWith("e-")) { setFlash(id); setTimeout(() => setFlash(null), 2200); } };
  const open = (e: LifeEvent) => { setView("story"); setQ(""); setKinds([]); setTimeout(() => go(`e-${e.slug}`), 60); };

  return (
    <div className="bg-white">
      {/* Opening */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
          
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-[34px] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[46px]" style={serif}>His life, year by year</h1>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">The life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva in chapters. Each moment shows where it happened, who was there, and opens into the lectures recorded that year.</p>
            </div>
            <dl className="flex gap-7 text-ink">
              {[[eras.length, "chapters"], [events.length, "moments"], [places, "places"]].map(([n, l]) => <div key={l}><dt className="text-[26px] font-semibold leading-none tabular-nums" style={serif}>{n}</dt><dd className="mt-1 text-[11.5px] text-ink-3">{l}</dd></div>)}
            </dl>
          </div>
          {/* Controls */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a place, a person, a year…" className="h-10 w-full rounded-full border border-line-strong bg-white pl-9 pr-9 text-[13.5px] outline-none focus:border-saffron" />
              {q && <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"><X size={15} /></button>}
            </label>
            <div className="flex rounded-full border border-line-strong p-0.5 text-[12.5px]" role="tablist">
              {([["story", Rows3, "Full story"], ["highlights", Sparkles, "Highlights"], ["years", CalendarRange, "All years"]] as const).map(([v, I, l]) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`flex h-8 items-center gap-1.5 rounded-full px-3 transition ${view === v ? "bg-saffron text-white" : "text-ink-2 hover:text-ink"}`}><I size={14} />{l}</button>
              ))}
            </div>
          </div>
          {usedKinds.length > 1 && <div className="mt-3 flex flex-wrap gap-1.5">
            {usedKinds.map(([k, l, c]) => { const on = kinds.includes(k); return (
              <button key={k} onClick={() => setKinds((s) => (on ? s.filter((x) => x !== k) : [...s, k]))} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition ${on ? "border-transparent text-white" : "border-line text-ink-2 hover:border-line-strong"}`} style={on ? { background: c } : undefined}>
                <span className="h-2 w-2 rounded-full" style={{ background: on ? "#fff" : c }} />{l}</button>); })}
            {kinds.length > 0 && <button onClick={() => setKinds([])} className="px-2 text-[12px] text-ink-3 underline">Clear</button>}
          </div>}
        </div>
      </section>

      {/* Chapter bar */}
      {view !== "years" && <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
        <div className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-5 py-2 sm:px-8 [scrollbar-width:none]">
          {chapters.map((c, i) => (
            <button key={c.era.id} onClick={() => go(`era-${i}`)} className={`shrink-0 rounded-full px-3 py-1.5 text-left text-[12px] transition ${activeEra === i ? "bg-saffron-tint text-saffron" : "text-ink-2 hover:bg-band"} ${c.events.length ? "" : "opacity-40"}`}>
              <span className="font-medium">{c.era.title}</span> <span className="tabular-nums text-ink-3">{c.era.year_from === c.era.year_to ? c.era.year_from : `${c.era.year_from}–${String(c.era.year_to).slice(-2)}`}</span>
            </button>))}
        </div>
      </div>}

      {!list.length ? <p className="mx-auto max-w-xl px-5 py-24 text-center text-[14px] text-ink-3">Nothing matches. Try another word, or clear the filters.</p> :
      view === "years" ? <YearsView chapters={chapters} recordings={recordings} onOpen={open} /> : (
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[120px_minmax(0,1fr)]">
          {/* Year rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-[130px] max-h-[calc(100dvh-160px)] overflow-y-auto pr-2 [scrollbar-width:thin]">
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">Years</p>
              {years.map((y) => (
                <button key={y} onClick={() => go(`y-${y}`)} className={`group flex w-full items-center gap-2 rounded-md px-2 py-[3px] text-left text-[12.5px] tabular-nums transition ${activeYear === y ? "bg-saffron-tint font-semibold text-saffron" : "text-ink-2 hover:text-ink"}`}>
                  <span className="w-9">{y}</span>
                  <span className="h-1 flex-1 rounded-full bg-line" title={recordings[y] ? `${recordings[y]} recordings` : undefined}><span className="block h-1 rounded-full bg-saffron/50" style={{ width: `${((recordings[y] || 0) / maxRec) * 100}%` }} /></span>
                </button>))}
              {Object.keys(recordings).length > 0 && <p className="mt-3 px-2 text-[10.5px] leading-snug text-ink-3">The bar shows how many of his lectures were recorded that year.</p>}
            </div>
          </aside>

          <div>
            {chapters.map((c, i) => !c.events.length ? null : (
              <section key={c.era.id} id={`era-${i}`} data-era={i} className="mb-16 scroll-mt-32">
                <ChapterHead n={i + 1} era={c.era} count={c.events.length} rec={Object.entries(recordings).filter(([y]) => +y >= c.era.year_from && +y <= c.era.year_to).reduce((s, [, n]) => s + n, 0)} />
                {c.years.map(({ y, events: es }) => (
                  <div key={y} id={`y-${y}`} data-year={y} className="grid scroll-mt-36 grid-cols-[54px_minmax(0,1fr)] sm:grid-cols-[84px_minmax(0,1fr)]">
                    <div className="relative pr-3 pt-4 text-right sm:pr-5"><span className="sticky top-[128px] text-[17px] font-semibold tabular-nums text-saffron sm:text-[21px]" style={serif}>{y}</span></div>
                    <ol className="relative space-y-3 border-l border-line pb-6 pl-5 pt-4 sm:pl-7">
                      {es.map((e) => <EventCard key={e.id} e={e} rec={recordings[e.year]} lit={flash === `e-${e.slug}`} />)}
                    </ol>
                  </div>))}
              </section>))}
          </div>
        </div>)}
    </div>
  );
}

function ChapterHead({ n, era, count, rec }: { n: number; era: Era; count: number; rec: number }) {
  return (
    <header className="mb-4 grid items-center gap-5 rounded-3xl bg-[#f7f7f7] p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:p-5">
      {era.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={era.image} alt="" className="hidden aspect-[4/5] w-full rounded-2xl object-cover object-top sm:block" loading="lazy" /> : <span className="hidden sm:block" />}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-saffron">Chapter {n} · {era.year_from === era.year_to ? era.year_from : `${era.year_from} – ${era.year_to}`}</p>
        <h2 className="mt-1.5 text-[26px] leading-tight tracking-[-0.01em] text-ink sm:text-[32px]" style={serif}>{era.title}</h2>
        {era.subtitle && <p className="mt-0.5 text-[13px] text-ink-3">{era.subtitle}</p>}
        {era.summary && <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-ink-2">{era.summary}</p>}
        <p className="mt-3 text-[12px] text-ink-3">{count} moment{count === 1 ? "" : "s"}{rec ? ` · ${rec.toLocaleString()} recorded lectures from these years` : ""}</p>
      </div>
    </header>
  );
}

function EventCard({ e, rec, lit }: { e: LifeEvent; rec?: number; lit: boolean }) {
  const [, label, color] = kindOf(e.kind); const [more, setMore] = useState(false); const [copied, setCopied] = useState(false);
  const share = () => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}#e-${e.slug}`); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const dot = <span aria-hidden className={`absolute top-[22px] rounded-full ring-4 ring-white ${e.importance === 1 ? "-left-[27px] h-3.5 w-3.5 sm:-left-[35px]" : "-left-[25px] h-2.5 w-2.5 sm:-left-[33px]"}`} style={{ background: color }} />;
  if (e.importance === 3) return (
    <li id={`e-${e.slug}`} className={`relative scroll-mt-40 rounded-lg px-1 py-1 transition ${lit ? "bg-saffron-tint" : ""}`}>
      <span aria-hidden className="absolute -left-[23px] top-[13px] h-1.5 w-1.5 rounded-full sm:-left-[31px]" style={{ background: color }} />
      <p className="text-[13.5px] text-ink-2"><span className="mr-2 text-[12px] tabular-nums text-ink-3">{when(e)}</span><span className="font-medium text-ink">{e.title}</span>{e.place && <span className="text-ink-3"> · {e.place}</span>}{e.summary && <span> — {e.summary}</span>}</p>
    </li>);
  const big = e.importance === 1;
  return (
    <li id={`e-${e.slug}`} className="relative scroll-mt-40">
      {dot}
      <article className={`group overflow-hidden rounded-2xl border bg-white transition ${lit ? "border-saffron shadow-[0_0_0_4px_rgba(133,53,0,0.12)]" : "border-line hover:border-line-strong hover:shadow-sm"}`}>
        <div className={big && e.image ? "grid sm:grid-cols-[minmax(0,1fr)_220px]" : ""}>
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
              <span className="font-medium tabular-nums text-ink-2">{when(e)}</span>
              <span className="flex items-center gap-1 font-medium" style={{ color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label}</span>
              {big && <span className="rounded-full bg-saffron-tint px-2 py-0.5 font-semibold text-saffron">Milestone</span>}
            </div>
            <h3 className={`mt-1.5 leading-snug text-ink ${big ? "text-[21px] sm:text-[24px]" : "text-[17px]"}`} style={serif}>{e.title}</h3>
            {e.summary && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{e.summary}</p>}
            {!big && e.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={e.image} alt={e.image_caption || ""} className="mt-3 max-h-56 rounded-xl object-cover" loading="lazy" />}
            {e.body && <>
              {more && <div className="mt-3 whitespace-pre-line border-t border-line pt-3 text-[14px] leading-[1.75] text-ink-2">{e.body}</div>}
              <button onClick={() => setMore(!more)} className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-saffron">{more ? "Show less" : "Read the full account"}<ChevronDown size={14} className={more ? "rotate-180" : ""} /></button>
            </>}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px]">
              {e.place && <Link href={`/search?q=${encodeURIComponent(e.place)}`} className="flex items-center gap-1 rounded-full bg-band px-2.5 py-1 text-ink-2 hover:text-saffron"><MapPin size={12} />{e.place}{e.country && e.country !== "India" ? `, ${e.country}` : ""}</Link>}
              {e.people.length > 0 && <span className="flex items-center gap-1 rounded-full bg-band px-2.5 py-1 text-ink-2"><Users size={12} />{e.people.join(", ")}</span>}
              {!!rec && <Link href={`/teachings/audio?year=${e.year}`} className="flex items-center gap-1 rounded-full bg-band px-2.5 py-1 text-ink-2 hover:text-saffron"><Headphones size={12} />{rec} lectures from {e.year}</Link>}
              {e.links.map((l) => <a key={l.url} href={l.url} className="rounded-full border border-line px-2.5 py-1 text-ink-2 hover:border-saffron hover:text-saffron">{l.label}</a>)}
              <button onClick={share} title="Copy a link to this moment" className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-ink-3 opacity-0 transition hover:text-saffron group-hover:opacity-100 max-sm:opacity-100">{copied ? <Check size={13} /> : <Link2 size={13} />}{copied ? "Copied" : ""}</button>
            </div>
            {e.source && <p className="mt-2 text-[11px] italic text-ink-3">Source: {e.source}</p>}
          </div>
          {big && e.image && <figure className="relative bg-band">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={e.image} alt={e.image_caption || e.title} className="h-full max-h-72 w-full object-cover sm:max-h-none" loading="lazy" />{e.image_caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-2 text-[11px] text-white">{e.image_caption}</figcaption>}</figure>}
        </div>
      </article>
    </li>
  );
}

function YearsView({ chapters, recordings, onOpen }: { chapters: { era: Era; years: { y: number; events: LifeEvent[] }[] }[]; recordings: Record<number, number>; onOpen: (e: LifeEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      {chapters.filter((c) => c.years.length).map((c) => (
        <section key={c.era.id} className="mb-10">
          <h2 className="mb-3 flex items-baseline gap-3 text-[20px] text-ink" style={serif}>{c.era.title}<span className="font-sans text-[12px] tabular-nums text-ink-3">{c.era.year_from === c.era.year_to ? c.era.year_from : `${c.era.year_from}–${c.era.year_to}`}</span></h2>
          <div className="divide-y divide-line rounded-2xl border border-line">
            {c.years.map(({ y, events }) => (
              <div key={y} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 px-4 py-3 sm:grid-cols-[90px_minmax(0,1fr)_120px]">
                <span className="text-[16px] font-semibold tabular-nums text-saffron" style={serif}>{y}</span>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((e) => { const [, , color] = kindOf(e.kind); return (
                    <button key={e.id} onClick={() => onOpen(e)} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-left text-[12.5px] transition hover:border-saffron ${e.importance === 1 ? "border-line-strong font-medium text-ink" : "border-line text-ink-2"}`}>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />{e.title}</button>); })}
                </div>
                <span className="hidden text-right text-[12px] text-ink-3 sm:block">{recordings[y] ? <Link href={`/teachings/audio?year=${y}`} className="hover:text-saffron">{recordings[y]} lectures</Link> : ""}</span>
              </div>))}
          </div>
        </section>))}
    </div>
  );
}
