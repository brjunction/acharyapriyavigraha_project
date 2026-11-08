import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, FileText, ListVideo, Play, Search } from "lucide-react";
import { getShelf, getQueue, getVideoNav, getSection, getChannels, searchVideos } from "@/lib/video-home";
import { watchHref } from "@/lib/video-layouts";
import { QueuePlayer, VideoCard, PagedVideos, VideoTabsBar, SectionView, ChannelChip, AdvancedVideos } from "./video-home";
import { advancedVideos, type AdvFilter } from "@/lib/video-advanced";
import { sql } from "@/lib/db";
import { getVideo, findMovedVideo } from "@/lib/cms/library";
import { redirect } from "next/navigation";

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (v: any) => (v.day ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(v.day.split("-").map(Number)) : v.year ? String(v.year) : "");
const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min` : `${Math.floor(s / 60)} min`);

/** One video: the player, its details, the same lecture as audio, and more from that year and place. */
/** The tab bar on every Videos page. */
export async function VideosShell({ active, children }: { active: string; children: React.ReactNode }) {
  const nav = await getVideoNav();
  return <div className="min-h-[60vh] bg-white"><VideoTabsBar tabs={nav.sections} active={active} channels={nav.channels} all={nav.all} />{children}</div>;
}

export async function VideoPage({ slug, list, sec }: { slug: string; list?: string; sec?: string }) {
  const v = await getVideo(slug);
  if (!v) { const moved = await findMovedVideo(slug); if (moved) redirect(`/teachings/videos/${moved}${list ? `?list=${list}` : sec ? `?sec=${sec}` : ""}`); notFound(); }
  const shelf = await getQueue({ list, sec }).catch(() => null);
  const shelfRef = list ? ((await sql`select ref, kind from video_sources where id::text = ${list}`.catch(() => [])) as any[]).filter((r) => r.kind === "playlist")[0]?.ref || null : null; const at = shelf ? shelf.items.findIndex((x) => x.slug === v.slug) : -1; const next = shelf && at >= 0 ? shelf.items[at + 1] : undefined;
  const more = (await sql`select slug, title, youtube_id, date, year from videos where status = 'published' and id <> ${v.id} and ((${v.year}::int is not null and coalesce(year, extract(year from date)::int) = ${v.year}) or (place is not null and place = ${v.place}) or (series is not null and series = ${v.series})) order by date desc nulls last limit 8`.catch(() => [])) as any[];
  const facts: [string, string | null, string | null][] = [["Date", when(v) || null, null], ["Place", [v.place, v.country].filter(Boolean).join(", ") || null, v.place ? `/teachings/videos/search?q=${encodeURIComponent(v.place)}` : null], ["Type", v.type || null, null], ["Verse", v.scripture || null, null], ["Channel", v.series || v.channel || null, null], ["Length", dur(v.duration_sec) || null, null]];
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-5 sm:px-6">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            {v.youtube_id && <QueuePlayer id={v.youtube_id} title={v.title} next={next && shelf ? watchHref(next, shelf.param) : undefined} />}
            <h1 className="mt-5 text-[22px] leading-snug text-ink sm:text-[26px]">{v.title}</h1>
            <p className="mt-1.5 text-[13px] text-ink-3">{[when(v), [v.place, v.country].filter(Boolean).join(", "), v.type].filter(Boolean).join(" · ")}</p>
            {v.audio_slug && <Link href={`/teachings/audio/${v.audio_slug}`} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-ink-2 hover:border-saffron hover:text-saffron"><FileText size={14} />Read the transcription of this lecture</Link>}
            {v.description && <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{v.description}</p>}
          </article>
          <aside className="space-y-6">
            {shelf && at >= 0 && <div className="overflow-hidden rounded-xl border border-line">
              <Link href={shelf.href} className="flex items-center gap-2 border-b border-line bg-band/50 px-3 py-2.5 hover:text-saffron"><ListVideo size={16} className="shrink-0 text-saffron" /><span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{shelf.name}</span><span className="text-[12px] tabular-nums text-ink-3">{at + 1} / {shelf.items.length}</span></Link>
              <ol className="max-h-[420px] overflow-y-auto">{shelf.items.map((x, k) => <li key={x.slug}><Link href={watchHref(x, shelf.param)} className={`flex gap-2.5 px-3 py-2 ${k === at ? "bg-saffron-soft" : "hover:bg-band"}`}><span className="w-5 shrink-0 pt-1 text-center text-[11px] tabular-nums text-ink-3">{k === at ? <Play size={11} fill="currentColor" className="mx-auto mt-0.5 text-saffron" /> : k + 1}</span>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`https://i.ytimg.com/vi/${x.yt}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-24 shrink-0 rounded-md object-cover" /><span className={`line-clamp-3 text-[12.5px] leading-snug ${k === at ? "font-semibold text-ink" : "text-ink-2"}`}>{x.title}</span></Link></li>)}</ol>
              {next && <p className="border-t border-line px-3 py-2 text-[12px] text-ink-3">Next plays by itself: <span className="text-ink-2">{next.title}</span></p>}
            </div>}
            <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">{facts.filter(([, x]) => x).map(([k, x, h]) => <div key={k} className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-3">{k}</dt><dd className="text-right text-ink">{h ? <Link href={h} className="hover:text-saffron">{x}</Link> : x}</dd></div>)}</dl>
            {v.youtube_id && <a href={`https://www.youtube.com/watch?v=${v.youtube_id}${list && shelfRef ? `&list=${shelfRef}` : ""}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px] text-ink hover:border-saffron">{list && shelfRef ? "Watch this playlist on YouTube" : "Watch on YouTube"}<ExternalLink size={13} className="text-ink-3" /></a>}
            {more.length > 0 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">More from this time and place</p><div className="space-y-3">{more.map((m) => <Link key={m.slug} href={`/teachings/videos/${m.slug}`} className="group flex gap-3">{m.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${m.youtube_id}/mqdefault.jpg`} alt="" className="aspect-video w-28 shrink-0 rounded-md object-cover" />}<span className="line-clamp-3 text-[12.5px] leading-snug text-ink-2 group-hover:text-saffron">{m.title}</span></Link>)}</div></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}

/** A channel or playlist: its picture, description and every video, in order. */
export async function ShelfPage({ id }: { id: string }) {
  const s = await getShelf(id); if (!s) notFound();
  return (
    <VideosShell active={s.kind === "channel" ? "channels" : ""}>
    <div className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6">
        <header className="flex flex-wrap items-center gap-5 border-b border-line pb-6">
          {s.avatar && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.avatar} alt="" className={`shrink-0 object-cover ${s.kind === "channel" ? "size-24 rounded-full" : "aspect-video w-48 rounded-xl"}`} />}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-saffron">{s.kind === "channel" ? "Channel" : "Playlist"}</p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">{s.name}</h1>
            <p className="mt-1 text-[13px] text-ink-3">{s.count.toLocaleString()} videos</p>
            {s.description && <p className="mt-2 line-clamp-3 max-w-3xl whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">{s.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {s.items[0] && <Link href={watchHref(s.items[0], `list=${s.id}`)} className="inline-flex h-11 items-center gap-2 rounded-full bg-saffron px-6 text-[14px] font-semibold text-white hover:brightness-110"><Play size={16} fill="currentColor" />Play all</Link>}
            <a href={s.kind === "channel" ? `https://www.youtube.com/channel/${s.ref}` : `https://www.youtube.com/playlist?list=${s.ref}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-white px-5 text-[14px] font-semibold text-ink hover:border-[#ff0000] hover:text-[#cc0000]"><ExternalLink size={15} />Open on YouTube</a>
          </div>
        </header>
        {!s.items.length ? <p className="py-16 text-center text-[14px] text-ink-3">The videos are being fetched.</p> :
          <PagedVideos items={s.items} q={`list=${s.id}`} />}
      </div>
    </div>
    </VideosShell>
  );
}

/** A section's own tab. */
export async function SectionPage({ slug }: { slug: string }) {
  const s = await getSection(slug); if (!s) notFound();
  return <VideosShell active={s.parent?.slug || slug}><SectionView s={s} /></VideosShell>;
}

/** Every channel with videos of Śrīla Gurudeva. */
export async function ChannelsPage() {
  const cs = await getChannels();
  return (
    <VideosShell active="channels">
      <div className="acc-saffron mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6">
        <header className="mb-6 rounded-[28px] bg-acc-tint p-5 sm:p-7"><h1 className="flex items-center gap-3 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[30px]"><span className="h-8 w-1.5 rounded-full bg-[var(--acc)]" />Channels</h1><p className="mt-1.5 pl-[18px] text-[14px] text-ink-2">Every channel with videos of Śrīla Gurudeva — watch them all here.</p></header>
        {!cs.length ? <p className="py-16 text-center text-[14px] text-ink-3">Channels are being added.</p> : <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">{cs.map((c) => <ChannelChip key={c.id} c={c} />)}</div>}
      </div>
    </VideosShell>
  );
}

/** Search every video by its title, description, place and verse. */
export async function SearchVideosPage({ q }: { q?: string }) {
  const res = q ? await searchVideos(q) : [];
  return (
    <VideosShell active="search">
      <div className="acc-saffron mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6">
        <form className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-line-strong bg-white p-1 pl-4 focus-within:border-saffron">
          <Search size={18} className="shrink-0 text-ink-3" />
          <input name="q" defaultValue={q || ""} autoFocus={!q} placeholder="Search every video — a word, place or verse" aria-label="Search videos" className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
          <button className="h-11 shrink-0 rounded-full bg-saffron px-6 text-[14px] font-semibold text-white hover:brightness-110">Search</button>
        </form>
        {q && <p className="mb-5 mt-6 text-[14px] text-ink-2"><b className="font-semibold text-ink">{res.length}{res.length === 200 ? "+" : ""}</b> videos for “{q}”</p>}
        {q && !res.length ? <p className="py-16 text-center text-[14px] text-ink-3">Nothing found. Try another word.</p> : <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">{res.map((v) => <VideoCard key={v.slug} v={v} />)}</div>}
      </div>
    </VideosShell>
  );
}

/** Advanced search: every filter at once. */
export async function AdvancedVideosPage({ f }: { f: AdvFilter }) {
  const r = await advancedVideos(f);
  return <VideosShell active="advanced"><AdvancedVideos f={f} r={r} /></VideosShell>;
}
