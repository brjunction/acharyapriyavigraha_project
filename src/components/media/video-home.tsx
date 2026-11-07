"use client";
/* Videos, like YouTube in one place: Shorts, the newest videos, every section of channels and playlists, and the channels at the bottom.
   “All videos” keeps the full library with filters. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListVideo, Play, Search, X, SlidersHorizontal, LayoutGrid } from "lucide-react";
import type { Shelf, VCard, VideoHome } from "@/lib/video-home";

const FILTER_KEYS = ["view", "q", "year", "place", "type", "scripture", "series", "topic", "language"];
const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = (d: string) => { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return dd ? `${dd} ${MON[m - 1]} ${y}` : String(y); };
const thumb = (id: string, q: "mq" | "hq" = "mq") => `https://i.ytimg.com/vi/${id}/${q}default.jpg`;
export const watchHref = (v: VCard, list?: string) => `/teachings/videos/${v.slug}${list ? `?list=${list}` : ""}`;

/** Home | All videos — the choice follows the address, so filtered links still open the full library. */
export function VideoTabs({ home, all, total }: { home: React.ReactNode; all: React.ReactNode; total: number }) {
  const [tab, setTab] = useState<"home" | "all">("home");
  useEffect(() => { const u = new URLSearchParams(location.search); if ([...u.keys()].some((k) => FILTER_KEYS.includes(k))) setTab("all"); }, []);
  const go = (t: "home" | "all") => { setTab(t); if (t === "home") history.replaceState(null, "", location.pathname); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => { const f = (e: Event) => setTab((e as CustomEvent).detail); window.addEventListener("tj:videotab", f); return () => window.removeEventListener("tj:videotab", f); }, []);
  return (
    <>
      <div className="mx-auto flex max-w-[1240px] items-center gap-1 px-4 pt-5 sm:px-6">
        {([["home", "Home", LayoutGrid], ["all", `All videos${total ? ` · ${total.toLocaleString()}` : ""}`, SlidersHorizontal]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => go(k)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${tab === k ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}><I size={15} />{l}</button>))}
      </div>
      {tab === "home" ? home : all}
    </>
  );
}

function openAll(q?: string) {
  const u = new URLSearchParams(); u.set("view", "all"); if (q) u.set("q", q);
  history.replaceState(null, "", `${location.pathname}?${u}`); window.dispatchEvent(new CustomEvent("tj:videotab", { detail: "all" }));
}

export function VideoHomeView({ data }: { data: VideoHome }) {
  const [q, setQ] = useState("");
  const [shorts, setShorts] = useState<{ list: VCard[]; i: number } | null>(null);
  const empty = !data.sections.length && !data.latest.length;
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6">
      <form onSubmit={(e) => { e.preventDefault(); openAll(q.trim()); }} className="flex max-w-2xl items-center gap-2 rounded-full border border-line-strong bg-white p-1 pl-4 focus-within:border-saffron">
        <Search size={17} className="shrink-0 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search every video" aria-label="Search videos" className="h-10 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-3" />
        <button className="h-10 shrink-0 rounded-full bg-saffron px-5 text-[13.5px] font-semibold text-white hover:brightness-110">Search</button>
      </form>

      {data.sections.length > 1 && (
        <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6" aria-label="Sections">
          {data.sections.map((s) => <a key={s.title} href={`#${slug(s.title)}`} className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-2 transition hover:border-saffron hover:text-saffron">{s.title}</a>)}
          {data.channels.length > 0 && <a href="#channels" className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-2 transition hover:border-saffron hover:text-saffron">Channels</a>}
        </nav>)}

      {empty && <p className="py-20 text-center text-[14px] text-ink-3">Videos are being added.</p>}

      {data.sections.map((sec, si) => {
        const leadShorts = sec.shelves.every((s) => s.showAs === "shorts");
        return (
          <div key={sec.title}>
            <section id={slug(sec.title)} className="scroll-mt-24 pt-9">
              <h2 className="mb-3 flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em] text-ink"><span className="h-5 w-1 rounded-full bg-saffron" />{sec.title}</h2>
              {sec.shelves.filter((s) => s.showAs === "playlist").length > 0 && (
                <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">{sec.shelves.filter((s) => s.showAs === "playlist").map((s) => <PlaylistCard key={s.id} s={s} />)}</div>)}
              {sec.shelves.filter((s) => s.showAs !== "playlist").map((s) => (
                <div key={s.id} className="mb-6">
                  {(sec.shelves.length > 1 || s.name !== sec.title) && <ShelfHead s={s} />}
                  {s.showAs === "shorts" ? <ShortsRow items={s.items} onOpen={(i) => setShorts({ list: s.items, i })} /> : <Row items={s.items} list={s.id} />}
                  {sec.shelves.length === 1 && s.count > s.items.length && <Link href={`/teachings/videos/list/${s.id}`} className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-saffron hover:underline">See all {s.count} videos<ChevronRight size={14} /></Link>}
                </div>))}
            </section>
            {/* The newest videos come right after the Shorts at the top */}
            {si === 0 && leadShorts && <Latest items={data.latest} />}
          </div>);
      })}
      {!(data.sections[0]?.shelves.every((s) => s.showAs === "shorts")) && <Latest items={data.latest} />}

      {data.channels.length > 0 && (
        <section id="channels" className="scroll-mt-24 border-t border-line pt-9 mt-6">
          <h2 className="mb-1 flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em] text-ink"><span className="h-5 w-1 rounded-full bg-saffron" />Channels</h2>
          <p className="mb-5 text-[13px] text-ink-3">Every channel with videos of Śrīla Gurudeva — watch them all here.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.channels.map((c) => (
              <Link key={c.id} href={`/teachings/videos/list/${c.id}`} className="group flex flex-col items-center rounded-2xl border border-line bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-saffron/40 hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,.3)]">
                {c.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.avatar} alt="" loading="lazy" className="size-16 rounded-full object-cover ring-1 ring-line transition group-hover:scale-105" /> : <span className="flex size-16 items-center justify-center rounded-full bg-band text-ink-3"><Play size={22} /></span>}
                <span className="mt-2.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink group-hover:text-saffron">{c.name}</span>
                <span className="mt-0.5 text-[12px] text-ink-3">{c.count.toLocaleString()} videos</span>
              </Link>))}
          </div>
        </section>)}
      {shorts && <ShortsPlayer list={shorts.list} start={shorts.i} onClose={() => setShorts(null)} />}
    </div>
  );
}
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");

function Latest({ items }: { items: VCard[] }) {
  if (!items.length) return null;
  return (
    <section className="pt-9">
      <h2 className="mb-3 flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em] text-ink"><span className="h-5 w-1 rounded-full bg-saffron" />Newest videos</h2>
      <Row items={items} />
      <button onClick={() => openAll()} className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-saffron hover:underline">See every video<ChevronRight size={14} /></button>
    </section>
  );
}

function ShelfHead({ s }: { s: Shelf }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      {s.avatar && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.avatar} alt="" className={`shrink-0 object-cover ${s.kind === "channel" ? "size-8 rounded-full" : "h-8 w-12 rounded-md"}`} />}
      <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{s.name}</p>
      <Link href={`/teachings/videos/list/${s.id}`} className="flex shrink-0 items-center gap-0.5 rounded-full px-3 py-1 text-[13px] font-medium text-saffron hover:bg-saffron-soft">See all {s.count > 0 ? s.count : ""}<ChevronRight size={14} /></Link>
    </div>
  );
}

/** A horizontal row of videos with arrows. */
function Row({ items, list }: { items: VCard[]; list?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="group/row relative">
      <div ref={ref} className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6">
        {items.map((v) => <VideoCard key={v.slug} v={v} list={list} className="w-[72vw] shrink-0 snap-start sm:w-[260px]" />)}
      </div>
      {items.length > 4 && <>
        <button onClick={() => by(-1)} aria-label="Previous" className="absolute -left-3 top-[30%] hidden size-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition hover:text-saffron group-hover/row:flex"><ChevronLeft size={20} /></button>
        <button onClick={() => by(1)} aria-label="Next" className="absolute -right-3 top-[30%] hidden size-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition hover:text-saffron group-hover/row:flex"><ChevronRight size={20} /></button>
      </>}
    </div>
  );
}

export function VideoCard({ v, list, className = "" }: { v: VCard; list?: string; className?: string }) {
  return (
    <Link href={watchHref(v, list)} className={`group block ${className}`}>
      <div className="relative overflow-hidden rounded-xl bg-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(v.yt)} alt="" loading="lazy" className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        {v.seconds > 0 && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] tabular-nums text-white">{dur(v.seconds)}</span>}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100"><span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-saffron"><Play size={20} fill="currentColor" className="ml-0.5" /></span></span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:text-saffron">{v.title}</h3>
      {v.date && <p className="mt-0.5 text-[12px] text-ink-3">{when(v.date)}</p>}
    </Link>
  );
}

/** A playlist: one card; a click starts the first video and the rest follow by themselves. */
function PlaylistCard({ s }: { s: Shelf }) {
  const first = s.items[0]; if (!first) return null;
  return (
    <div className="group">
      <Link href={watchHref(first, s.id)} className="relative block">
        <span aria-hidden className="absolute inset-x-3 -top-2 h-3 rounded-t-xl bg-line-strong/60" /><span aria-hidden className="absolute inset-x-1.5 -top-1 h-2 rounded-t-xl bg-line-strong" />
        <span className="relative block overflow-hidden rounded-xl bg-band">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.avatar || thumb(first.yt, "hq")} alt="" loading="lazy" className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          <span className="absolute inset-y-0 right-0 flex w-[38%] flex-col items-center justify-center gap-1 bg-black/70 text-white"><ListVideo size={22} /><span className="text-[13px] font-semibold tabular-nums">{s.count}</span><span className="text-[11px] opacity-80">videos</span></span>
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-[13px] font-semibold text-white opacity-0 transition group-hover:opacity-100"><Play size={16} fill="currentColor" className="mr-1.5" />Play all</span>
        </span>
      </Link>
      <Link href={`/teachings/videos/list/${s.id}`} className="mt-2 line-clamp-2 block text-[13.5px] font-medium leading-snug text-ink hover:text-saffron">{s.name}</Link>
      <p className="mt-0.5 text-[12px] text-ink-3">Playlist · {s.count} videos</p>
    </div>
  );
}

/** Shorts: tall cards; a click opens them one after another, like on YouTube. */
function ShortsRow({ items, onOpen }: { items: VCard[]; onOpen: (i: number) => void }) {
  return (
    <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      {items.map((v, i) => (
        <button key={v.slug} onClick={() => onOpen(i)} className="group w-[150px] shrink-0 snap-start text-left sm:w-[170px]">
          <span className="relative block overflow-hidden rounded-2xl bg-band">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(v.yt, "hq")} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
            <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          </span>
          <span className="mt-1.5 line-clamp-2 block text-[13px] font-medium leading-snug text-ink group-hover:text-saffron">{v.title}</span>
        </button>))}
    </div>
  );
}

function ShortsPlayer({ list, start, onClose }: { list: VCard[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start); const v = list[i];
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown" || e.key === "ArrowRight") setI((x) => Math.min(list.length - 1, x + 1)); if (e.key === "ArrowUp" || e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1)); }; document.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [list.length, onClose]);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3" onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"><X size={22} /></button>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous" className="hidden size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 sm:flex"><ChevronLeft size={24} /></button>
        <div className="w-[min(92vw,calc((100svh-120px)*9/16))]">
          <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-black"><iframe key={v.yt} src={`https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0`} title={v.title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
          <p className="mt-2 line-clamp-2 text-center text-[14px] text-white">{v.title}</p>
          <div className="mt-2 flex justify-center gap-3 sm:hidden"><button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="rounded-full bg-white/15 px-5 py-2 text-[14px] text-white disabled:opacity-30">Previous</button><button onClick={() => setI(Math.min(list.length - 1, i + 1))} disabled={i === list.length - 1} className="rounded-full bg-white/15 px-5 py-2 text-[14px] text-white disabled:opacity-30">Next</button></div>
        </div>
        <button onClick={() => setI(Math.min(list.length - 1, i + 1))} disabled={i === list.length - 1} aria-label="Next" className="hidden size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 sm:flex"><ChevronRight size={24} /></button>
      </div>
    </div>
  );
}

/** The player on a watch page: when a video ends, the next one in the playlist starts. */
export function QueuePlayer({ id, title, next }: { id: string; title: string; next?: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!next) return; let player: any; let stop = false;
    const make = () => { const YT = (window as any).YT; if (stop || !YT?.Player || !box.current) return;
      const el = document.createElement("div"); box.current.innerHTML = ""; box.current.appendChild(el);
      player = new YT.Player(el, { videoId: id, host: "https://www.youtube-nocookie.com", playerVars: { autoplay: 1, rel: 0 }, events: { onStateChange: (e: any) => { if (e.data === 0) window.location.href = next; } } }); };
    if ((window as any).YT?.Player) make(); else {
      const prev = (window as any).onYouTubeIframeAPIReady; (window as any).onYouTubeIframeAPIReady = () => { prev?.(); make(); };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) { const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); }
    }
    return () => { stop = true; try { player?.destroy(); } catch {} if (box.current) box.current.innerHTML = ""; };
  }, [id, next]);
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-black [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full">
      {next ? <div ref={box} /> : <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
    </div>
  );
}
