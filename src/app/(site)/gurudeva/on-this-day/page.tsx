import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarHeart } from "lucide-react";
import { sql, hasDb } from "@/lib/db";
import { PageHero } from "@/components/ui";
import { LectureRow } from "@/components/lecture";
import { toLecture } from "@/lib/cms/library";

export const revalidate = 3600;
export const metadata = { title: "On this day — Śrīla Gurudeva", description: "What Śrī Śrīmad Gour Govinda Swāmī Gurudeva did, said and wrote on this day of the year: moments of his life, lectures and diary pages.", alternates: { canonical: "/gurudeva/on-this-day" } };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const q = async (p: Promise<any[]>) => { try { return await p; } catch { return []; } };

/** On this day: his life, lectures and diary on one day of the year, any year. */
export default async function Page({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const sp = await searchParams; const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const m0 = /^(\d{2})-(\d{2})$/.exec(sp.d || ""); let m = m0 ? Number(m0[1]) : now.getMonth() + 1; let d = m0 ? Number(m0[2]) : now.getDate();
  if (m < 1 || m > 12) m = 1; if (d < 1 || d > DAYS[m - 1]) d = 1;
  const key = (mm: number, dd: number) => `${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const shift = (k: number) => { const t = new Date(Date.UTC(2024, m - 1, d + k)); return key(t.getUTCMonth() + 1, t.getUTCDate()); };
  const [moments, lectures, diary, days] = hasDb() ? await Promise.all([
    q(sql`select slug, year, title, summary, place, image from life_events where status = 'published' and month = ${m} and day = ${d} order by year`),
    q(sql`select slug, code, title, kind, type, to_char(date, 'YYYY-MM-DD') date, date_note, place, country, scripture, canto, chapter, verse, language, series, topics, duration_sec, audio_url, audio_direct, audio_direct2, transcript_status from audios where status = 'published' and extract(month from date) = ${m} and extract(day from date) = ${d} order by date`),
    q(sql`select slug, to_char(date, 'YYYY-MM-DD') date, place, left(coalesce(translation, ''), 320) excerpt from diary_entries where status = 'published' and extract(month from date) = ${m} and extract(day from date) = ${d} order by date`),
    // which days of the year hold anything, for the month strip
    q(sql`select k, count(*)::int n from (select to_char(make_date(2000, month, day), 'MM-DD') k from life_events where status = 'published' and month is not null and day is not null union all select to_char(date, 'MM-DD') from audios where status = 'published' and date is not null union all select to_char(date, 'MM-DD') from diary_entries where status = 'published' and date is not null) x group by k`),
  ]) : [[], [], [], []];
  const has = new Map((days as any[]).map((r) => [r.k, r.n]));
  const total = moments.length + lectures.length + diary.length;
  const title = `${d} ${MONTHS[m - 1]}`;
  return (
    <>
      <PageHero crumbs={[{ href: "/gurudeva", label: "Śrīla Gurudeva" }, { label: "On this day" }]} icon={CalendarHeart} title={`On this day · ${title}`} intro="What Śrīla Gurudeva did, said and wrote on this day of the year — in any year." />
      <div className="mx-auto max-w-[1000px] px-4 pb-20 pt-8 sm:px-6">
        <nav className="flex items-center justify-between gap-3">
          <Link href={`/gurudeva/on-this-day?d=${shift(-1)}`} className="inline-flex h-9 items-center gap-1 rounded-full border border-line px-3 text-[13px] text-ink-2 hover:border-ink-3 hover:text-ink"><ChevronLeft size={15} />Previous day</Link>
          <form action="/gurudeva/on-this-day" className="flex items-center gap-1.5"><select name="d" defaultValue={key(m, d)} className="h-9 rounded-full border border-line bg-white px-3 text-[13px]">{MONTHS.map((mn, i) => Array.from({ length: DAYS[i] }, (_, j) => key(i + 1, j + 1))).flat().map((k) => <option key={k} value={k}>{Number(k.slice(3))} {MONTHS[Number(k.slice(0, 2)) - 1]}{has.get(k) ? " •" : ""}</option>)}</select><button className="h-9 rounded-full bg-ink px-4 text-[13px] font-medium text-white">Go</button></form>
          <Link href={`/gurudeva/on-this-day?d=${shift(1)}`} className="inline-flex h-9 items-center gap-1 rounded-full border border-line px-3 text-[13px] text-ink-2 hover:border-ink-3 hover:text-ink">Next day<ChevronRight size={15} /></Link>
        </nav>
        <div className="mt-5 grid grid-cols-7 gap-1 sm:grid-cols-[repeat(16,minmax(0,1fr))]" aria-label={`Days of ${MONTHS[m - 1]}`}>{Array.from({ length: DAYS[m - 1] }, (_, i) => { const k = key(m, i + 1); const n = has.get(k) || 0; const on = i + 1 === d; return <Link key={k} href={`/gurudeva/on-this-day?d=${k}`} title={n ? `${n} in the archive` : undefined} className={`flex h-9 flex-col items-center justify-center rounded-md text-[12.5px] tabular-nums transition ${on ? "bg-ink font-semibold text-white" : n ? "bg-saffron/10 font-medium text-ink hover:bg-saffron/20" : "text-ink-3 hover:bg-band"}`}>{i + 1}{n > 0 && !on && <span className="-mt-0.5 size-1 rounded-full bg-saffron" />}</Link>; })}</div>

        {!total ? <p className="mt-10 rounded-xl border border-dashed border-line px-6 py-12 text-center text-[13.5px] text-ink-3">Nothing in the archive is dated {title} yet. The days marked with a dot hold something — try one of them.</p> : <>
          {moments.length > 0 && <section className="mt-10"><h2 className="mb-3 border-b border-line pb-2 text-[14px] font-semibold text-ink">In his life</h2><ol className="divide-y divide-line rounded-lg border border-line">{(moments as any[]).map((x) => <li key={x.slug}><Link href={`/gurudeva/timeline#m-${x.slug}`} className="flex gap-4 px-4 py-3 hover:bg-band/50">{x.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.image} alt="" className="size-16 shrink-0 rounded-md object-cover" />}<span className="min-w-0"><span className="block text-[12px] font-semibold tabular-nums text-saffron">{d} {MONTHS[m - 1]} {x.year}{x.place ? ` · ${x.place}` : ""}</span><span className="block text-[15px] font-medium text-ink">{x.title}</span>{x.summary && <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink-2">{x.summary}</span>}</span></Link></li>)}</ol></section>}
          {lectures.length > 0 && <section className="mt-10"><h2 className="mb-3 border-b border-line pb-2 text-[14px] font-semibold text-ink">His lectures on {title}</h2><div className="divide-y divide-line rounded-lg border border-line px-3">{(lectures as any[]).map((r) => <LectureRow key={r.slug} l={{ ...toLecture(r), ...(r.code ? { href: `/audios/${r.code}` } : {}) }} />)}</div></section>}
          {diary.length > 0 && <section className="mt-10"><h2 className="mb-3 border-b border-line pb-2 text-[14px] font-semibold text-ink">His diary</h2><div className="grid gap-3 sm:grid-cols-2">{(diary as any[]).map((x) => <Link key={x.slug} href={`/gurudeva/diaries/${x.slug}`} className="rounded-lg border border-line p-4 transition hover:border-line-strong"><span className="block text-[12px] font-semibold tabular-nums text-saffron">{new Date(x.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}{x.place ? ` · ${x.place}` : ""}</span>{x.excerpt && <span className="mt-1.5 line-clamp-4 block font-serif text-[14.5px] leading-relaxed text-ink-2">{x.excerpt}</span>}</Link>)}</div></section>}
        </>}
      </div>
    </>
  );
}
