import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, FileText, ListVideo, Play } from "lucide-react";
import { getShelf } from "@/lib/video-home";
import { QueuePlayer, VideoCard, watchHref } from "./video-home";
import { sql } from "@/lib/db";
import { getVideo } from "@/lib/cms/library";

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (v: any) => (v.day ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(v.day.split("-").map(Number)) : v.year ? String(v.year) : "");
const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min` : `${Math.floor(s / 60)} min`);

/** One video: the player, its details, the same lecture as audio, and more from that year and place. */
export async function VideoPage({ slug, list }: { slug: string; list?: string }) {
  const v = await getVideo(slug); if (!v) notFound();
  const shelf = list ? await getShelf(list) : null; const at = shelf ? shelf.items.findIndex((x) => x.slug === v.slug) : -1; const next = shelf && at >= 0 ? shelf.items[at + 1] : undefined;
  const more = (await sql`select slug, title, youtube_id, date, year from videos where status = 'published' and id <> ${v.id} and ((${v.year}::int is not null and coalesce(year, extract(year from date)::int) = ${v.year}) or (place is not null and place = ${v.place}) or (series is not null and series = ${v.series})) order by date desc nulls last limit 8`.catch(() => [])) as any[];
  const facts: [string, string | null, string | null][] = [["Date", when(v) || null, v.year || v.day ? `/teachings/videos?year=${(v.day || String(v.year)).slice(0, 4)}` : null], ["Place", [v.place, v.country].filter(Boolean).join(", ") || null, v.place ? `/teachings/videos?place=${encodeURIComponent(`${v.country || "Unknown country"}/${v.place}`)}` : null], ["Type", v.type || null, v.type ? `/teachings/videos?type=${encodeURIComponent(v.type)}` : null], ["Verse", v.scripture || null, null], ["Channel", v.series || v.channel || null, null], ["Length", dur(v.duration_sec) || null, null]];
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6">
        
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            {v.youtube_id && <QueuePlayer id={v.youtube_id} title={v.title} next={next && shelf ? watchHref(next, shelf.id) : undefined} />}
            <h1 className="mt-5 text-[22px] leading-snug text-ink sm:text-[26px]">{v.title}</h1>
            <p className="mt-1.5 text-[13px] text-ink-3">{[when(v), [v.place, v.country].filter(Boolean).join(", "), v.type].filter(Boolean).join(" · ")}</p>
            {v.audio_slug && <Link href={`/teachings/audio/${v.audio_slug}`} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-ink-2 hover:border-saffron hover:text-saffron"><FileText size={14} />Read the transcription of this lecture</Link>}
            {v.description && <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{v.description}</p>}
          </article>
          <aside className="space-y-6">
            {shelf && at >= 0 && <div className="overflow-hidden rounded-xl border border-line">
              <Link href={`/teachings/videos/list/${shelf.id}`} className="flex items-center gap-2 border-b border-line bg-band/50 px-3 py-2.5 hover:text-saffron"><ListVideo size={16} className="shrink-0 text-saffron" /><span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{shelf.name}</span><span className="text-[12px] tabular-nums text-ink-3">{at + 1} / {shelf.count}</span></Link>
              <ol className="max-h-[420px] overflow-y-auto">{shelf.items.map((x, k) => <li key={x.slug}><Link href={watchHref(x, shelf.id)} className={`flex gap-2.5 px-3 py-2 ${k === at ? "bg-saffron-soft" : "hover:bg-band"}`}><span className="w-5 shrink-0 pt-1 text-center text-[11px] tabular-nums text-ink-3">{k === at ? <Play size={11} fill="currentColor" className="mx-auto mt-0.5 text-saffron" /> : k + 1}</span>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`https://i.ytimg.com/vi/${x.yt}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-24 shrink-0 rounded-md object-cover" /><span className={`line-clamp-3 text-[12.5px] leading-snug ${k === at ? "font-semibold text-ink" : "text-ink-2"}`}>{x.title}</span></Link></li>)}</ol>
              {next && <p className="border-t border-line px-3 py-2 text-[12px] text-ink-3">Next plays by itself: <span className="text-ink-2">{next.title}</span></p>}
            </div>}
            <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">{facts.filter(([, x]) => x).map(([k, x, h]) => <div key={k} className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-3">{k}</dt><dd className="text-right text-ink">{h ? <Link href={h} className="hover:text-saffron">{x}</Link> : x}</dd></div>)}</dl>
            {v.youtube_id && <a href={`https://www.youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px] text-ink hover:border-saffron">Watch on YouTube<ExternalLink size={13} className="text-ink-3" /></a>}
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
    <div className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6">
        <Link href="/teachings/videos" className="text-[13px] text-ink-3 hover:text-saffron">← All videos</Link>
        <header className="mt-4 flex flex-wrap items-center gap-5 border-b border-line pb-6">
          {s.avatar && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.avatar} alt="" className={`shrink-0 object-cover ${s.kind === "channel" ? "size-24 rounded-full" : "aspect-video w-48 rounded-xl"}`} />}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-saffron">{s.kind === "channel" ? "Channel" : "Playlist"}</p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">{s.name}</h1>
            <p className="mt-1 text-[13px] text-ink-3">{s.count.toLocaleString()} videos</p>
            {s.description && <p className="mt-2 line-clamp-3 max-w-3xl whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">{s.description}</p>}
          </div>
          {s.items[0] && <Link href={watchHref(s.items[0], s.id)} className="inline-flex h-11 items-center gap-2 rounded-full bg-saffron px-6 text-[14px] font-semibold text-white hover:brightness-110"><Play size={16} fill="currentColor" />Play all</Link>}
        </header>
        {!s.items.length ? <p className="py-16 text-center text-[14px] text-ink-3">The videos are being fetched.</p> :
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{s.items.map((v) => <VideoCard key={v.slug} v={v} list={s.id} />)}</div>}
      </div>
    </div>
  );
}
