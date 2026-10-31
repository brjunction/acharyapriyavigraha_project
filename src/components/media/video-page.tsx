import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, FileText } from "lucide-react";
import { sql } from "@/lib/db";
import { getVideo } from "@/lib/cms/library";

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const when = (v: any) => (v.day ? (([y, m, d]) => `${d} ${MON[m - 1]} ${y}`)(v.day.split("-").map(Number)) : v.year ? String(v.year) : "");
const dur = (s: number) => (!s ? "" : s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min` : `${Math.floor(s / 60)} min`);

/** One video: the player, its details, the same lecture as audio, and more from that year and place. */
export async function VideoPage({ slug }: { slug: string }) {
  const v = await getVideo(slug); if (!v) notFound();
  const more = (await sql`select slug, title, youtube_id, date, year from videos where status = 'published' and id <> ${v.id} and ((${v.year}::int is not null and coalesce(year, extract(year from date)::int) = ${v.year}) or (place is not null and place = ${v.place}) or (series is not null and series = ${v.series})) order by date desc nulls last limit 8`.catch(() => [])) as any[];
  const facts: [string, string | null, string | null][] = [["Date", when(v) || null, v.year || v.day ? `/teachings/videos?year=${(v.day || String(v.year)).slice(0, 4)}` : null], ["Place", [v.place, v.country].filter(Boolean).join(", ") || null, v.place ? `/teachings/videos?place=${encodeURIComponent(`${v.country || "Unknown country"}/${v.place}`)}` : null], ["Type", v.type || null, v.type ? `/teachings/videos?type=${encodeURIComponent(v.type)}` : null], ["Verse", v.scripture || null, null], ["Channel", v.series || v.channel || null, null], ["Length", dur(v.duration_sec) || null, null]];
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6">
        
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            {v.youtube_id && <div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${v.youtube_id}`} title={v.title} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div>}
            <h1 className="mt-5 text-[22px] leading-snug text-ink sm:text-[26px]" style={{ fontFamily: "var(--font-reading-serif)" }}>{v.title}</h1>
            <p className="mt-1.5 text-[13px] text-ink-3">{[when(v), [v.place, v.country].filter(Boolean).join(", "), v.type].filter(Boolean).join(" · ")}</p>
            {v.audio_slug && <Link href={`/teachings/audio/${v.audio_slug}`} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] text-ink-2 hover:border-saffron hover:text-saffron"><FileText size={14} />Read the transcription of this lecture</Link>}
            {v.description && <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{v.description}</p>}
          </article>
          <aside className="space-y-6">
            <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">{facts.filter(([, x]) => x).map(([k, x, h]) => <div key={k} className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-3">{k}</dt><dd className="text-right text-ink">{h ? <Link href={h} className="hover:text-saffron">{x}</Link> : x}</dd></div>)}</dl>
            {v.youtube_id && <a href={`https://www.youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px] text-ink hover:border-saffron">Watch on YouTube<ExternalLink size={13} className="text-ink-3" /></a>}
            {more.length > 0 && <div><p className="mb-2 text-[12px] font-medium text-ink-3">More from this time and place</p><div className="space-y-3">{more.map((m) => <Link key={m.slug} href={`/teachings/videos/${m.slug}`} className="group flex gap-3">{m.youtube_id && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${m.youtube_id}/mqdefault.jpg`} alt="" className="aspect-video w-28 shrink-0 rounded-md object-cover" />}<span className="line-clamp-3 text-[12.5px] leading-snug text-ink-2 group-hover:text-saffron">{m.title}</span></Link>)}</div></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
