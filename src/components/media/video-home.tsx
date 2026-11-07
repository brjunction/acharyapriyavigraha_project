"use client";
/* Videos — organised by sections made in the Studio. Each section has its own design and colour.
   Calm on a phone: few videos per section on Home, rows swipe sideways, every section has its own tab. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListVideo, Play, Search, X } from "lucide-react";
import type { Shelf, VCard, VSection } from "@/lib/video-home";

const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = (d: string) => { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return dd ? `${dd} ${MON[m - 1]} ${y}` : String(y); };
const thumb = (id: string, q: "mq" | "hq" | "maxres" = "mq") => `https://i.ytimg.com/vi/${id}/${q === "maxres" ? "maxresdefault" : `${q}default`}.jpg`;
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const watchHref = (v: VCard, q?: string) => `/teachings/videos/${v.slug}${q ? `?${q}` : ""}`;

/* ---------- The tab bar along the top of every Videos page ---------- */
export function VideoTabsBar({ tabs, active, channels }: { tabs: { name: string; slug: string; color: string }[]; active: string; channels: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [active]);
  const all = [{ name: "Home", slug: "", color: "saffron" }, ...tabs, ...(channels ? [{ name: "Channels", slug: "channels", color: "saffron" }] : [])];
  return (
    <div className="sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur sm:top-[58px]">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <div ref={ref} className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 py-2 [scrollbar-width:none]">
          {all.map((t) => { const on = active === (t.slug || "home"); const href = !t.slug ? "/teachings/videos" : t.slug === "channels" ? "/teachings/videos/channels" : `/teachings/videos/s/${t.slug}`; return (
            <Link key={t.slug || "home"} href={href} aria-current={on ? "page" : undefined}
              className={`acc-${t.color} flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition ${on ? "bg-[var(--acc)] text-white shadow-[0_4px_14px_-6px_var(--acc)]" : "text-ink-2 hover:bg-acc-tint hover:text-ink"}`}>
              {t.slug && t.slug !== "channels" && <span className={`size-2 rounded-full ${on ? "bg-white" : "bg-[var(--acc)]"}`} />}{t.name}
            </Link>); })}
        </div>
        <form action="/teachings/videos/search" className="relative hidden w-56 shrink-0 md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input name="q" placeholder="Search videos" aria-label="Search videos" className="h-9 w-full rounded-full border border-line bg-band/50 pl-9 pr-3 text-[13px] outline-none focus:border-saffron focus:bg-white" />
        </form>
        <Link href="/teachings/videos/search" aria-label="Search videos" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 md:hidden"><Search size={16} /></Link>
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
export function VideoHomeView({ sections, latest, channels }: { sections: VSection[]; latest: VCard[]; channels: Shelf[] }) {
  const [shorts, setShorts] = useState<{ list: VCard[]; i: number } | null>(null);
  return (
    <div className="mx-auto max-w-[1240px] space-y-5 px-4 pb-16 pt-6 sm:space-y-7 sm:px-6">
      {!sections.length && (latest.length ? <Block title="Newest videos" color="saffron"><Row items={latest} /></Block> : <p className="py-20 text-center text-[14px] text-ink-3">Videos are being added.</p>)}
      {sections.map((s) => (
        <Block key={s.id} title={s.name} intro={s.intro} color={s.color} more={{ href: `/teachings/videos/s/${s.slug}`, label: s.layout === "playlists" ? `All ${s.playlists.length} playlists` : `All ${s.count}` }}>
          <SectionBody s={s} home onShorts={(i) => setShorts({ list: s.items, i })} />
        </Block>))}
      {channels.length > 0 && (
        <Block title="Channels" color="saffron" more={{ href: "/teachings/videos/channels", label: "All channels" }}>
          <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
            {channels.map((c) => <ChannelChip key={c.id} c={c} />)}
          </div>
        </Block>)}
      {shorts && <ShortsPlayer list={shorts.list} start={shorts.i} onClose={() => setShorts(null)} />}
    </div>
  );
}

/** A section's panel: soft colour, a coloured title, and a way to its own tab. */
function Block({ title, intro, color, more, children }: { title: string; intro?: string | null; color: string; more?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className={`acc-${color} rounded-[28px] bg-acc-tint p-4 sm:p-6`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em] text-ink sm:text-[21px]"><span className="h-6 w-1.5 rounded-full bg-[var(--acc)]" />{title}</h2>
          {intro && <p className="mt-1 pl-4 text-[13px] text-ink-3">{intro}</p>}
        </div>
        {more && <Link href={more.href} className="flex shrink-0 items-center gap-0.5 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[var(--acc)] shadow-[0_1px_3px_rgba(0,0,0,.08)] transition hover:shadow-md">{more.label}<ChevronRight size={15} /></Link>}
      </div>
      {children}
    </section>
  );
}

/** One section in its chosen design. `home` shows a few; the section's own tab shows all. */
export function SectionBody({ s, home = false, onShorts }: { s: VSection; home?: boolean; onShorts?: (i: number) => void }) {
  const q = `sec=${s.slug}`; const it = s.items;
  if (s.layout === "playlists") return home
    ? <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-4">{s.playlists.slice(0, 8).map((p) => <PlaylistCard key={p.id} s={p} className="w-[72vw] shrink-0 snap-start sm:w-auto" />)}</div>
    : <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">{s.playlists.map((p) => <PlaylistCard key={p.id} s={p} />)}</div>;
  if (!it.length) return <p className="py-8 text-center text-[13.5px] text-ink-3">Videos are being added.</p>;
  if (s.layout === "shorts") return home
    ? <ShortsRow items={it} onOpen={(i) => onShorts?.(i)} />
    : <ShortsGrid items={it} />;
  if (s.layout === "featured") {
    const [a, ...rest] = it;
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-6">
        <BigCard v={a} q={q} />
        <div className="flex flex-col gap-3">
          {(home ? rest.slice(0, 4) : rest.slice(0, 4)).map((v, k) => <ListCard key={v.slug} v={v} q={q} className={k >= 2 ? "max-sm:hidden" : ""} />)}
        </div>
        {!home && rest.length > 4 && <div className="lg:col-span-2"><Grid items={rest.slice(4)} q={q} /></div>}
      </div>);
  }
  if (s.layout === "spotlight") {
    const [a, ...rest] = it;
    return (<div className="space-y-4"><Banner v={a} q={q} />{home ? <Row items={rest} q={q} /> : <Grid items={rest} q={q} />}</div>);
  }
  if (s.layout === "grid") return home ? <><Grid items={it.slice(0, 8)} q={q} mobileMax={4} /></> : <Grid items={it} q={q} />;
  return home ? <Row items={it} q={q} /> : <Grid items={it} q={q} />;
}

/* ---------- Cards ---------- */
function Thumb({ v, big = false, className = "" }: { v: VCard; big?: boolean; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-band ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb(v.yt, big ? "hq" : "mq")} alt="" loading="lazy" className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      {v.seconds > 0 && <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] tabular-nums text-white">{dur(v.seconds)}</span>}
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:bg-black/15 group-hover:opacity-100"><span className={`flex items-center justify-center rounded-full bg-white/95 text-[var(--acc,#853500)] shadow-lg ${big ? "size-16" : "size-12"}`}><Play size={big ? 26 : 20} fill="currentColor" className="ml-0.5" /></span></span>
    </div>
  );
}
export function VideoCard({ v, q, className = "" }: { v: VCard; q?: string; className?: string }) {
  return (
    <Link href={watchHref(v, q)} className={`group block ${className}`}>
      <Thumb v={v} />
      <h3 className="mt-2.5 line-clamp-2 text-[14px] font-medium leading-snug text-ink group-hover:text-[var(--acc,#853500)]">{v.title}</h3>
      {v.date && <p className="mt-0.5 text-[12px] text-ink-3">{when(v.date)}</p>}
    </Link>
  );
}
function BigCard({ v, q }: { v: VCard; q: string }) {
  return (
    <Link href={watchHref(v, q)} className="group block rounded-3xl bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,.06)] transition hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,.35)] sm:p-3">
      <Thumb v={v} big />
      <div className="px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug text-ink group-hover:text-[var(--acc)] sm:text-[18px]">{v.title}</h3>
        {v.date && <p className="mt-1 text-[12.5px] text-ink-3">{when(v.date)}</p>}
      </div>
    </Link>
  );
}
function ListCard({ v, q, className = "" }: { v: VCard; q: string; className?: string }) {
  return (
    <Link href={watchHref(v, q)} className={`group flex gap-3 rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,.06)] transition hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,.3)] ${className}`}>
      <Thumb v={v} className="w-36 shrink-0 !rounded-xl sm:w-44" />
      <span className="min-w-0 py-1"><span className="line-clamp-3 text-[13.5px] font-medium leading-snug text-ink group-hover:text-[var(--acc)]">{v.title}</span>{v.date && <span className="mt-1 block text-[12px] text-ink-3">{when(v.date)}</span>}</span>
    </Link>
  );
}
function Banner({ v, q }: { v: VCard; q: string }) {
  return (
    <Link href={watchHref(v, q)} className="group relative block overflow-hidden rounded-3xl bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb(v.yt, "hq")} alt="" className="aspect-video w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] lg:aspect-[21/8]" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4 sm:p-7">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--acc)] shadow-lg transition group-hover:scale-110 sm:size-14"><Play size={22} fill="currentColor" className="ml-0.5" /></span>
        <span className="min-w-0"><span className="line-clamp-2 text-[17px] font-semibold leading-snug text-white sm:text-[24px]">{v.title}</span>{v.date && <span className="mt-1 block text-[12.5px] text-white/75">{when(v.date)}{v.seconds ? ` · ${dur(v.seconds)}` : ""}</span>}</span>
      </span>
    </Link>
  );
}
/** Swipes sideways (arrows on a computer). */
function Row({ items, q }: { items: VCard[]; q?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="group/row relative">
      <div ref={ref} className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {items.map((v) => <VideoCard key={v.slug} v={v} q={q} className="w-[70vw] shrink-0 snap-start sm:w-[264px]" />)}
      </div>
      {items.length > 4 && <>
        <button onClick={() => by(-1)} aria-label="Previous" className="absolute -left-2 top-[28%] hidden size-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:text-[var(--acc)] sm:group-hover/row:flex"><ChevronLeft size={20} /></button>
        <button onClick={() => by(1)} aria-label="Next" className="absolute -right-2 top-[28%] hidden size-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:text-[var(--acc)] sm:group-hover/row:flex"><ChevronRight size={20} /></button>
      </>}
    </div>
  );
}
function Grid({ items, q, mobileMax }: { items: VCard[]; q?: string; mobileMax?: number }) {
  const [n, setN] = useState(48);
  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">{items.slice(0, n).map((v, k) => <VideoCard key={v.slug} v={v} q={q} className={mobileMax && k >= mobileMax ? "max-sm:hidden" : ""} />)}</div>
      {items.length > n && <div className="pt-6 text-center"><button onClick={() => setN((x) => x + 48)} className="rounded-full bg-white px-6 py-2.5 text-[13.5px] font-medium text-ink shadow-[0_1px_3px_rgba(0,0,0,.1)] hover:text-[var(--acc)]">Show more ({items.length - n} left)</button></div>}
    </>
  );
}
function PlaylistCard({ s, className = "" }: { s: Shelf; className?: string }) {
  const first = s.items[0]; const href = first ? watchHref(first, `list=${s.id}`) : `/teachings/videos/list/${s.id}`;
  return (
    <div className={`group ${className}`}>
      <Link href={href} className="relative block pt-2">
        <span aria-hidden className="absolute inset-x-4 top-0 h-3 rounded-t-xl bg-[var(--acc)] opacity-20" /><span aria-hidden className="absolute inset-x-2 top-1 h-3 rounded-t-xl bg-[var(--acc)] opacity-35" />
        <span className="relative block overflow-hidden rounded-2xl bg-band">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first ? thumb(first.yt, "hq") : s.avatar || ""} alt="" loading="lazy" className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[11.5px] font-medium text-white"><ListVideo size={13} />{s.count} videos</span>
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-[13.5px] font-semibold text-white opacity-0 transition group-hover:opacity-100"><Play size={17} fill="currentColor" className="mr-1.5" />Play all</span>
        </span>
      </Link>
      <Link href={`/teachings/videos/list/${s.id}`} className="mt-2.5 line-clamp-2 block text-[14px] font-medium leading-snug text-ink hover:text-[var(--acc)]">{s.name}</Link>
      <p className="mt-0.5 text-[12px] text-ink-3">Playlist</p>
    </div>
  );
}
export function ChannelChip({ c }: { c: Shelf }) {
  return (
    <Link href={`/teachings/videos/list/${c.id}`} className="group flex w-24 shrink-0 snap-start flex-col items-center text-center sm:w-auto">
      {c.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.avatar} alt="" loading="lazy" className="size-20 rounded-full object-cover ring-4 ring-white transition duration-300 group-hover:scale-105 group-hover:ring-[var(--acc)]/30" /> : <span className="flex size-20 items-center justify-center rounded-full bg-white text-ink-3 ring-4 ring-white"><Play size={24} /></span>}
      <span className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-[var(--acc)]">{c.name}</span>
      <span className="text-[11.5px] text-ink-3">{c.count} videos</span>
    </Link>
  );
}

/* ---------- Shorts ---------- */
function ShortCard({ v, onClick }: { v: VCard; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <span className="relative block overflow-hidden rounded-2xl bg-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(v.yt, "hq")} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 pt-10"><span className="line-clamp-3 text-[12.5px] font-medium leading-snug text-white">{v.title}</span></span>
      </span>
    </button>
  );
}
function ShortsRow({ items, onOpen }: { items: VCard[]; onOpen: (i: number) => void }) {
  return <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6">{items.map((v, i) => <div key={v.slug} className="w-[40vw] shrink-0 snap-start sm:w-[176px]"><ShortCard v={v} onClick={() => onOpen(i)} /></div>)}</div>;
}
function ShortsGrid({ items }: { items: VCard[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return <><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{items.map((v, i) => <ShortCard key={v.slug} v={v} onClick={() => setOpen(i)} />)}</div>{open !== null && <ShortsPlayer list={items} start={open} onClose={() => setOpen(null)} />}</>;
}
function ShortsPlayer({ list, start, onClose }: { list: VCard[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start); const v = list[i];
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown" || e.key === "ArrowRight") setI((x) => Math.min(list.length - 1, x + 1)); if (e.key === "ArrowUp" || e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1)); }; document.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [list.length, onClose]);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-3" onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"><X size={22} /></button>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous" className="hidden size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 sm:flex"><ChevronLeft size={24} /></button>
        <div className="w-[min(92vw,calc((100svh-130px)*9/16))]">
          <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-black"><iframe key={v.yt} src={`https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0`} title={v.title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
          <p className="mt-2 line-clamp-2 text-center text-[14px] text-white">{v.title}</p>
          <p className="text-center text-[12px] text-white/60">{i + 1} / {list.length}</p>
          <div className="mt-2 flex justify-center gap-3 sm:hidden"><button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="rounded-full bg-white/15 px-5 py-2 text-[14px] text-white disabled:opacity-30">Previous</button><button onClick={() => setI(Math.min(list.length - 1, i + 1))} disabled={i === list.length - 1} className="rounded-full bg-white/15 px-5 py-2 text-[14px] text-white disabled:opacity-30">Next</button></div>
        </div>
        <button onClick={() => setI(Math.min(list.length - 1, i + 1))} disabled={i === list.length - 1} aria-label="Next" className="hidden size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-30 sm:flex"><ChevronRight size={24} /></button>
      </div>
    </div>
  );
}

/* ---------- A section's own tab ---------- */
export function SectionView({ s }: { s: VSection }) {
  const [f, setF] = useState("");
  const items = useMemo(() => (f ? s.items.filter((v) => fold(v.title).includes(fold(f))) : s.items), [f, s.items]);
  const view = f ? { ...s, layout: s.layout === "shorts" ? "shorts" : "grid", items } as VSection : s;
  return (
    <div className={`acc-${s.color} mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6`}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-[28px] bg-acc-tint p-5 sm:p-7">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[30px]"><span className="h-8 w-1.5 rounded-full bg-[var(--acc)]" />{s.name}</h1>
          {s.intro && <p className="mt-1.5 max-w-2xl pl-[18px] text-[14px] text-ink-2">{s.intro}</p>}
          <p className="mt-1 pl-[18px] text-[13px] text-ink-3">{s.layout === "playlists" ? `${s.playlists.length} playlists` : `${s.count} videos`}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {s.layout !== "playlists" && s.items.length > 12 && <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={f} onChange={(e) => setF(e.target.value)} placeholder={`Find in ${s.name}`} className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-3 text-[13.5px] outline-none focus:border-[var(--acc)]" /></label>}
          {s.layout !== "playlists" && s.layout !== "shorts" && s.items[0] && <Link href={watchHref(s.items[0], `sec=${s.slug}`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--acc)] px-5 text-[13.5px] font-semibold text-white hover:brightness-110"><Play size={15} fill="currentColor" />Play all</Link>}
        </div>
      </header>
      {f && !items.length ? <p className="py-16 text-center text-[14px] text-ink-3">Nothing found in {s.name}.</p> : <SectionBody s={view} />}
    </div>
  );
}

/** The player on a watch page: when a video ends, the next one in the section or playlist starts. */
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
    <div className="aspect-video overflow-hidden rounded-2xl bg-black [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full">
      {next ? <div ref={box} /> : <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
    </div>
  );
}
