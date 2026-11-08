"use client";
/* Videos — organised by sections made in the Studio. Each section has its own design and colour.
   Calm on a phone: few videos per section on Home, rows swipe sideways, every section has its own tab. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListVideo, Play, Search, X, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdvFilter, AdvResult } from "@/lib/video-advanced";
import { LENGTHS } from "@/lib/video-layouts";
import type { Shelf, VCard, VSection } from "@/lib/video-home";

const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = (d: string) => { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return dd ? `${dd} ${MON[m - 1]} ${y}` : String(y); };
const thumb = (id: string, q: "mq" | "hq" | "maxres" = "mq") => `https://i.ytimg.com/vi/${id}/${q === "maxres" ? "maxresdefault" : `${q}default`}.jpg`;
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
import { watchHref } from "@/lib/video-layouts";
import { Pager, usePages } from "@/components/ui/pager";
export { watchHref };

/* ---------- The tab bar along the top of every Videos page ---------- */
export function VideoTabsBar({ tabs, active, channels }: { tabs: { name: string; slug: string; color: string }[]; active: string; channels: number }) {
  const ref = useRef<HTMLDivElement>(null); const [away, setAway] = useState(false);
  useEffect(() => { ref.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [active]);
  useEffect(() => { let y = window.scrollY; const f = () => { const n = window.scrollY; if (Math.abs(n - y) < 6) return; setAway(n > y && n > 160); y = n; }; window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const all = [{ name: "Home", slug: "", color: "saffron" }, ...tabs, ...(channels ? [{ name: "Channels", slug: "channels", color: "saffron" }] : [])];
  return (
    <div className={`sticky top-[52px] z-30 border-b border-line bg-white/95 backdrop-blur transition-transform duration-300 sm:top-[58px] ${away ? "-translate-y-[calc(100%+60px)]" : ""}`}>
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <div ref={ref} className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 py-2 [scrollbar-width:none]">
          {all.map((t) => { const on = active === (t.slug || "home"); const href = !t.slug ? "/teachings/videos" : t.slug === "channels" ? "/teachings/videos/channels" : `/teachings/videos/s/${t.slug}`; return (
            <Link key={t.slug || "home"} href={href} aria-current={on ? "page" : undefined}
              className={`acc-${t.color} flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition ${on ? "bg-[var(--acc)] text-white shadow-[0_4px_14px_-6px_var(--acc)]" : "text-ink-2 hover:bg-acc-tint hover:text-ink"}`}>
              {t.slug && t.slug !== "channels" && <span className={`size-2 rounded-full ${on ? "bg-white" : "bg-[var(--acc)]"}`} />}{t.name}
            </Link>); })}
        </div>
        <Link href="/teachings/videos/advanced" aria-current={active === "advanced" ? "page" : undefined} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${active === "advanced" ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"}`}><SlidersHorizontal size={14} /><span className="max-sm:hidden">Advanced</span></Link>
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
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 pb-16 pt-6 sm:space-y-10 sm:px-6">
      {!sections.length && (latest.length ? <Block title="Newest videos" color="saffron"><Row items={latest} /></Block> : <p className="py-20 text-center text-[14px] text-ink-3">Videos are being added.</p>)}
      {sections.map((s) => <SectionBlock key={s.id} s={s} onShorts={(list, i) => setShorts({ list, i })} />)}
      {channels.length > 0 && !hasChannels(sections) && (
        <Block title="Our YouTube channels" intro="Open a channel on YouTube to subscribe." color="saffron">
          <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
            {channels.map((c) => <ChannelChip key={c.id} c={c} />)}
          </div>
        </Block>)}
      {shorts && <ShortsPlayer list={shorts.list} start={shorts.i} onClose={() => setShorts(null)} />}
    </div>
  );
}

const hasChannels = (xs: VSection[]): boolean => xs.some((x) => x.layout === "channels" || hasChannels(x.children || []));
const moreOf = (s: VSection) => ({ href: `/teachings/videos/s/${s.slug}`, label: s.layout === "playlists" ? `All ${s.playlists.length} playlists` : s.layout === "channels" ? `All ${s.playlists.length} channels` : ["folder", "tabs"].includes(s.layout) ? "Open" : `All ${s.count}` });

/** A section's panel: soft colour, a coloured title, a way to its own tab — and, when it folds, a header that opens and closes it.
    Sections inside sections sit on white, a size smaller. */
function Block({ title, intro, color, more, children, fold = "none", depth = 0 }: { title: string; intro?: string | null; color: string; more?: { href: string; label: string }; children: React.ReactNode; fold?: string; depth?: number }) {
  const [open, setOpen] = useState(fold !== "closed"); const can = fold === "open" || fold === "closed"; const sub = depth > 0;
  const head = (
    <div className="min-w-0">
      <h2 className={`flex items-center gap-2.5 font-semibold tracking-[-0.01em] text-ink ${sub ? "text-[15.5px] sm:text-[16.5px]" : "text-[19px] sm:text-[21px]"}`}><span className={`w-1.5 rounded-full bg-[var(--acc)] ${sub ? "h-5" : "h-6"}`} />{title}{can && <ChevronRight size={sub ? 16 : 18} className={`text-[var(--acc)] transition duration-300 ${open ? "rotate-90" : ""}`} />}</h2>
      {intro && <p className="mt-1 pl-4 text-[12.5px] text-ink-3 sm:text-[13px]">{intro}</p>}
    </div>);
  return (
    <section className={`acc-${color} ${sub ? "rounded-2xl border border-line bg-white p-3 sm:p-4" : "border-t border-line pt-6 first:border-t-0 first:pt-0 sm:pt-8"}`}>
      <div className={`flex items-end justify-between gap-3 ${open ? (sub ? "mb-3" : "mb-4") : ""}`}>
        {can ? <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-w-0 text-left">{head}</button> : head}
        {more && open && <Link href={more.href} className="flex shrink-0 items-center gap-0.5 rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-medium text-ink-2 transition hover:border-[var(--acc)] hover:text-[var(--acc)] sm:text-[13px]">{more.label}<ChevronRight size={15} /></Link>}
      </div>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="min-h-0 overflow-hidden">{children}</div></div>
    </section>
  );
}

/** A section and everything inside it, in its design: a Folder shows its sub-sections one below another,
    Tabs shows them as tabs to switch between; any other design shows its videos, then its sub-sections. */
export function SectionBlock({ s, depth = 0, onShorts, full = false }: { s: VSection; depth?: number; onShorts?: (list: VCard[], i: number) => void; full?: boolean }) {
  const inner = <SectionInner s={s} depth={depth} onShorts={onShorts} full={full} />;
  return <Block title={s.name} intro={s.intro} color={s.color} fold={s.fold} depth={depth} more={s.layout === "channels" ? undefined : moreOf(s)}>{inner}</Block>;
}
function SectionInner({ s, depth = 0, onShorts, full = false }: { s: VSection; depth?: number; onShorts?: (list: VCard[], i: number) => void; full?: boolean }) {
  const kids = s.children || [];
  if (s.layout === "tabs") return <ChildTabs list={kids} depth={depth} onShorts={onShorts} />;
  return (
    <div className="space-y-3 sm:space-y-4">
      {s.layout !== "folder" && <SectionBody s={s} home={!full} onShorts={(i) => onShorts?.(s.items, i)} />}
      {kids.map((c) => <SectionBlock key={c.id} s={c} depth={depth + 1} onShorts={onShorts} />)}
      {s.layout === "folder" && !kids.length && <p className="py-6 text-center text-[13px] text-ink-3">Nothing here yet.</p>}
    </div>
  );
}
/** Sub-sections as tabs inside a section. */
function ChildTabs({ list, depth, onShorts }: { list: VSection[]; depth: number; onShorts?: (list: VCard[], i: number) => void }) {
  const [i, setI] = useState(0); const cur = list[i];
  if (!cur) return <p className="py-6 text-center text-[13px] text-ink-3">Nothing here yet.</p>;
  return (
    <div>
      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {list.map((c, k) => <button key={c.id} onClick={() => setI(k)} className={`acc-${c.color} shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${k === i ? "bg-[var(--acc)] text-white" : "bg-white text-ink-2 hover:text-ink"}`}>{c.name}</button>)}
      </div>
      <div className={`acc-${cur.color}`}><SectionInner s={cur} depth={depth + 1} onShorts={onShorts} /></div>
    </div>
  );
}

/** One section in its chosen design. `home` shows a few; the section's own tab shows all. */
export function SectionBody({ s, home = false, onShorts }: { s: VSection; home?: boolean; onShorts?: (i: number) => void }) {
  const q = `sec=${s.slug}`; const it = s.items;
  if (s.layout === "playlists") return home
    ? <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-4">{s.playlists.slice(0, 8).map((p) => <PlaylistCard key={p.id} s={p} className="w-[72vw] shrink-0 snap-start sm:w-auto" />)}</div>
    : <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">{s.playlists.map((p) => <PlaylistCard key={p.id} s={p} />)}</div>;
  if (s.layout === "channels") return home
    ? <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">{s.playlists.slice(0, 16).map((c) => <ChannelChip key={c.id} c={c} />)}</div>
    : <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">{s.playlists.map((c) => <ChannelChip key={c.id} c={c} />)}</div>;
  if (!it.length) return <p className="py-8 text-center text-[13.5px] text-ink-3">Videos are being added.</p>;
  if (s.layout === "carousel") return <><Carousel items={home ? it.slice(0, 6) : it.slice(0, 8)} q={q} />{!home && it.length > 8 && <div className="mt-8"><Grid items={it.slice(8)} q={q} /></div>}</>;
  if (s.layout === "list") return <NumberedList items={home ? it.slice(0, 6) : it} q={q} />;
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
        {items.map((v) => <VideoCard key={v.slug} v={v} q={q} className="w-[60vw] shrink-0 snap-start sm:w-[248px]" />)}
      </div>
      {items.length > 4 && <>
        <button onClick={() => by(-1)} aria-label="Previous" className="absolute -left-2 top-[28%] hidden size-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:text-[var(--acc)] sm:group-hover/row:flex"><ChevronLeft size={20} /></button>
        <button onClick={() => by(1)} aria-label="Next" className="absolute -right-2 top-[28%] hidden size-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:text-[var(--acc)] sm:group-hover/row:flex"><ChevronRight size={20} /></button>
      </>}
    </div>
  );
}
/** Every video of a playlist, a page at a time. */
export function PagedVideos({ items, q }: { items: VCard[]; q: string }) {
  const P = usePages(items, 24, [items]);
  return <><div ref={P.top} className="grid grid-cols-1 gap-x-4 gap-y-7 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{P.slice.map((v) => <VideoCard key={v.slug} v={v} q={q} />)}</div><Pager {...P} total={items.length} per={24} label="videos" /></>;
}
function Grid({ items, q, mobileMax }: { items: VCard[]; q?: string; mobileMax?: number }) {
  const P = usePages(items, 24, [items]);
  return (
    <>
      <div ref={P.top} className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">{P.slice.map((v, k) => <VideoCard key={v.slug} v={v} q={q} className={mobileMax && k >= mobileMax ? "max-sm:hidden" : ""} />)}</div>
      <Pager {...P} total={items.length} per={24} label="videos" />
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
const channelUrl = (c: Shelf) => (c as any).url || (c.ref ? `https://www.youtube.com/channel/${c.ref}?sub_confirmation=1` : "https://www.youtube.com");
export function ChannelChip({ c }: { c: Shelf }) {
  return (
    <a href={channelUrl(c)} target="_blank" rel="noopener" title={`${c.name} on YouTube`} className="group flex w-24 shrink-0 snap-start flex-col items-center text-center sm:w-auto">
      {c.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.avatar} alt="" loading="lazy" className="size-20 rounded-full object-cover ring-4 ring-white transition duration-300 group-hover:scale-105 group-hover:ring-[var(--acc)]/30" /> : <span className="flex size-20 items-center justify-center rounded-full bg-white text-ink-3 ring-4 ring-white"><Play size={24} /></span>}
      <span className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-[var(--acc)]">{c.name}</span>
      <span className="text-[11.5px] text-ink-3">Open on YouTube</span>
    </a>
  );
}

/** Big slides that change by themselves; arrows and dots to choose. */
function Carousel({ items, q }: { items: VCard[]; q: string }) {
  const [i, setI] = useState(0); const [hold, setHold] = useState(false);
  useEffect(() => { if (hold || items.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 6000); return () => clearInterval(t); }, [hold, items.length]);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-black" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {items.map((v) => (
          <Link key={v.slug} href={watchHref(v, q)} className="group relative block w-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(v.yt, "hq")} alt="" loading="lazy" className="aspect-video w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.02] lg:aspect-[21/8]" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4 pb-10 sm:p-7 sm:pb-12"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--acc)] shadow-lg sm:size-14"><Play size={22} fill="currentColor" className="ml-0.5" /></span><span className="min-w-0"><span className="line-clamp-2 text-[17px] font-semibold leading-snug text-white sm:text-[24px]">{v.title}</span>{v.date && <span className="mt-1 block text-[12.5px] text-white/75">{when(v.date)}</span>}</span></span>
          </Link>))}
      </div>
      {items.length > 1 && <>
        <button onClick={() => setI((x) => (x - 1 + items.length) % items.length)} aria-label="Previous" className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow sm:flex"><ChevronLeft size={20} /></button>
        <button onClick={() => setI((x) => (x + 1) % items.length)} aria-label="Next" className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow sm:flex"><ChevronRight size={20} /></button>
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{items.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />)}</div>
      </>}
    </div>
  );
}
/** A neat numbered list, like a playlist. */
function NumberedList({ items, q }: { items: VCard[]; q: string }) {
  const P = usePages(items, 30, [items]); const n = P.from;
  return (
    <>
      <ol ref={P.top as any} className="grid gap-2 lg:grid-cols-2">
        {P.slice.map((v, j) => { const k = n + j; return (
          <li key={v.slug}><Link href={watchHref(v, q)} className="group flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 shadow-[0_1px_3px_rgba(0,0,0,.06)] transition hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,.3)]">
            <span className="w-7 shrink-0 text-center text-[15px] font-semibold tabular-nums text-[var(--acc)]">{k + 1}</span>
            <Thumb v={v} className="w-32 shrink-0 !rounded-xl sm:w-40" />
            <span className="min-w-0"><span className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink group-hover:text-[var(--acc)]">{v.title}</span>{v.date && <span className="mt-0.5 block text-[12px] text-ink-3">{when(v.date)}</span>}</span>
          </Link></li>); })}
      </ol>
      <Pager {...P} total={items.length} per={30} label="videos" />
    </>
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
  return <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6">{items.map((v, i) => <div key={v.slug} className="w-[26vw] shrink-0 snap-start sm:w-[124px] lg:w-[132px]"><ShortCard v={v} onClick={() => onOpen(i)} /></div>)}</div>;
}
function ShortsGrid({ items }: { items: VCard[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return <><div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 lg:grid-cols-7 xl:grid-cols-8">{items.map((v, i) => <ShortCard key={v.slug} v={v} onClick={() => setOpen(i)} />)}</div>{open !== null && <ShortsPlayer list={items} start={open} onClose={() => setOpen(null)} />}</>;
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
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[30px]"><span className="h-8 w-1.5 rounded-full bg-[var(--acc)]" />{s.name}</h1>
          {s.intro && <p className="mt-1.5 max-w-2xl pl-[18px] text-[14px] text-ink-2">{s.intro}</p>}
          <p className="mt-1 pl-[18px] text-[13px] text-ink-3">{s.layout === "playlists" ? `${s.playlists.length} playlists` : s.layout === "channels" ? `${s.playlists.length} channels` : `${s.count} videos`}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {s.layout !== "playlists" && s.layout !== "channels" && s.items.length > 12 && <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" /><input value={f} onChange={(e) => setF(e.target.value)} placeholder={`Find in ${s.name}`} className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-3 text-[13.5px] outline-none focus:border-[var(--acc)]" /></label>}
          {!["playlists", "channels", "shorts"].includes(s.layout) && s.items[0] && <Link href={watchHref(s.items[0], `sec=${s.slug}`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--acc)] px-5 text-[13.5px] font-semibold text-white hover:brightness-110"><Play size={15} fill="currentColor" />Play all</Link>}
        </div>
      </header>
      {f && !items.length ? <p className="py-16 text-center text-[14px] text-ink-3">Nothing found in {s.name}.</p> : <SectionInner s={view} full />}
    </div>
  );
}

/** The player on a watch page: when a video ends, the next one in the section or playlist starts. */
export function QueuePlayer({ id, title, next }: { id: string; title: string; next?: string }) {
  // The embed is always React's own iframe; the YouTube API only listens to it (to go on to the next video),
  // so nothing on the page is replaced behind React's back. If the API fails, the video still plays as usual.
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!next) return; let player: any = null; let stop = false;
    const attach = () => { try { const YT = (window as any).YT; if (stop || !YT?.Player || !frame.current) return; player = new YT.Player(frame.current, { events: { onStateChange: (e: any) => { if (e?.data === 0 && !stop) window.location.href = next; } } }); } catch {} };
    try {
      if ((window as any).YT?.Player) attach(); else {
        const prev = (window as any).onYouTubeIframeAPIReady; (window as any).onYouTubeIframeAPIReady = () => { try { prev?.(); } catch {} attach(); };
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) { const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; sc.async = true; document.head.appendChild(sc); }
      }
    } catch {}
    return () => { stop = true; try { player?.destroy?.(); } catch {} };
  }, [id, next]);
  const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0${next ? "&autoplay=1&enablejsapi=1" : ""}`;
  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe key={id} ref={frame} src={src} title={title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    </div>
  );
}

/* ---------- Advanced search: every filter at once, with counts ---------- */
export function AdvancedVideos({ f, r }: { f: AdvFilter; r: AdvResult }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [q, setQ] = useState(f.q || "");
  const go = (p: Partial<AdvFilter>) => { const n: Record<string, string> = {}; Object.entries({ ...f, page: undefined, ...p }).forEach(([k, v]) => { if (v) n[k] = String(v); }); router.push(`/teachings/videos/advanced${Object.keys(n).length ? `?${new URLSearchParams(n)}` : ""}`); };
  const on = Object.entries(f).filter(([k, v]) => v && !["page", "sort"].includes(k));
  const Sel = ({ k, label, opts, all = "All" }: { k: keyof AdvFilter; label: string; opts: { v: string; label: string; n?: number; depth?: number }[]; all?: string }) => (
    <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <select value={(f[k] as string) || ""} onChange={(e) => go({ [k]: e.target.value || undefined })} className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[13px] outline-none focus:border-saffron">
        <option value="">{all}</option>{opts.map((o) => <option key={o.v} value={o.v}>{"\u00a0\u00a0".repeat(o.depth || 0)}{o.label}{o.n ? ` (${o.n})` : ""}</option>)}
      </select></label>);
  const panel = (
    <div className="space-y-3.5">
      <form onSubmit={(e) => { e.preventDefault(); go({ q: q.trim() || undefined }); }} className="flex items-center gap-2 rounded-lg border border-line bg-white pl-2.5 focus-within:border-saffron">
        <Search size={15} className="shrink-0 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Words in the title" className="h-9 min-w-0 flex-1 bg-transparent text-[13px] outline-none" /><button className="h-9 shrink-0 rounded-r-lg bg-saffron px-3 text-[12.5px] font-semibold text-white">Go</button>
      </form>
      <Sel k="sec" label="Section" opts={r.facets.sections} all="All sections" />
      <Sel k="kind" label="Kind" opts={r.facets.kinds} all="All kinds" />
      <Sel k="lang" label="Language" opts={r.facets.langs} all="All languages" />
      <Sel k="year" label="Year" opts={r.facets.years} all="Any year" />
      <Sel k="place" label="Place" opts={r.facets.places} all="Any place" />
      <Sel k="src" label="Channel or playlist" opts={r.facets.sources.map((x) => ({ ...x, n: 0 }))} all="Any" />
      <Sel k="len" label="Length" opts={LENGTHS.map(([v, label]) => ({ v, label }))} all="Any length" />
      {on.length > 0 && <button onClick={() => router.push("/teachings/videos/advanced")} className="w-full rounded-lg border border-line py-2 text-[12.5px] font-medium text-ink-2 hover:border-ink-3">Clear all filters</button>}
    </div>);
  return (
    <div className="acc-saffron mx-auto max-w-[1240px] px-4 pb-16 pt-5 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-[130px] rounded-2xl bg-band/60 p-4">{panel}</div></aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="mr-auto text-[14px] text-ink-2"><b className="font-semibold text-ink">{r.total.toLocaleString()}</b> videos</p>
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium lg:hidden"><SlidersHorizontal size={14} />Filters{on.length ? ` (${on.length})` : ""}</button>
            <select value={f.sort || "newest"} onChange={(e) => go({ sort: e.target.value === "newest" ? undefined : e.target.value })} className="h-8 rounded-full border border-line bg-white px-3 text-[12.5px] outline-none"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="longest">Longest first</option><option value="shortest">Shortest first</option><option value="az">A–Z</option></select>
          </div>
          {open && <div className="mb-5 rounded-2xl bg-band/60 p-4 lg:hidden">{panel}</div>}
          {on.length > 0 && <div className="mb-4 flex flex-wrap gap-1.5">{on.map(([k, v]) => <button key={k} onClick={() => go({ [k]: undefined })} className="flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-[12px] text-ink">{k === "src" ? r.facets.sources.find((x) => x.v === v)?.label : k === "sec" ? r.facets.sections.find((x) => x.v === v)?.label : k === "kind" ? r.facets.kinds.find((x) => x.v === v)?.label || v : k === "len" ? LENGTHS.find(([x]) => x === v)?.[1] : String(v)}<X size={12} /></button>)}</div>}
          {!r.items.length ? <p className="py-16 text-center text-[14px] text-ink-3">No videos match. Try fewer filters.</p> : <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 xl:grid-cols-4">{r.items.map((v) => <VideoCard key={v.slug} v={v} />)}</div>}
          {r.pages > 1 && <div className="mt-8 flex items-center justify-center gap-2 text-[13px]">
            <button disabled={r.page <= 1} onClick={() => go({ ...f, page: String(r.page - 1) })} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Previous</button>
            <span className="px-2 text-ink-3">Page {r.page} of {r.pages}</span>
            <button disabled={r.page >= r.pages} onClick={() => go({ ...f, page: String(r.page + 1) })} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Next</button>
          </div>}
        </div>
      </div>
    </div>
  );
}
