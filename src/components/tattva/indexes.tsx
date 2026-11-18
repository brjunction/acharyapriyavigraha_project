/* The Tattva indexes (verses, years, places, people, A–Z): calm lists made to grow, with real counts only. */
import Link from "next/link";
import { ScrollText, CalendarRange, MapPin, Users2, ArrowDownAZ, BookA, ChevronRight } from "lucide-react";
import { LectureRow } from "@/components/lecture";
import { toLecture } from "@/lib/cms/library";
import { fmtDate } from "@/lib/data";
import { SCRIPTURES, CC_LILA, verseIndex, yearIndex, yearItems, placeIndex, placeItems, peopleIndex, personItems, azIndex, archiveHref, fold } from "@/lib/content/indexes";

export const INDEXES = [
  ["verses", "Verses", "Every lecture, verse by verse", ScrollText],
  ["years", "Years", "What each year holds", CalendarRange],
  ["places", "Places", "Where he spoke and travelled", MapPin],
  ["people", "People", "Personalities in his life", Users2],
  ["glossary", "Glossary", "Sanskrit and Odia terms", BookA],
  ["a-z", "A–Z", "Everything, alphabetically", ArrowDownAZ],
] as const;
const plural = (n: number, w: string) => `${n.toLocaleString()} ${w}${n === 1 ? "" : "s"}`;
const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

export function IndexNav({ at }: { at: string }) {
  return <nav aria-label="Indexes" className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">{INDEXES.map(([k, l, , I]) => <Link key={k} href={`/tattva/index/${k}`} aria-current={at === k ? "page" : undefined} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition ${at === k ? "bg-ink text-white" : "border border-line text-ink-2 hover:border-ink-3 hover:text-ink"}`}><I size={13} />{l}</Link>)}</nav>;
}
function Head({ title, intro, stats }: { title: string; intro: string; stats?: string[] }) {
  return <header className="mb-6"><p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-saffron">Tattva · Index</p><h1 className="mt-1 text-[24px] leading-tight text-ink sm:text-[28px]">{title}</h1><p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-2">{intro}</p>{stats && stats.filter(Boolean).length > 0 && <p className="mt-2 text-[12.5px] text-ink-3">{stats.filter(Boolean).join(" · ")}</p>}</header>;
}
function Empty({ text }: { text: string }) { return <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-[13.5px] leading-relaxed text-ink-3">{text}</p>; }
function Block({ title, n, children }: { title: string; n?: number; children: React.ReactNode }) {
  return <section className="mt-8 first:mt-0"><h2 className="mb-3 flex items-baseline justify-between border-b border-line pb-2 text-[14px] font-semibold text-ink">{title}{n != null && <span className="text-[12px] font-normal text-ink-3">{n}</span>}</h2>{children}</section>;
}
const Lectures = ({ rows }: { rows: any[] }) => <div className="divide-y divide-line rounded-lg border border-line px-3">{rows.map((r) => <LectureRow key={r.slug} l={{ ...toLecture(r), ...(r.code ? { href: `/audios/${r.code}` } : {}) }} />)}</div>;
const Videos = ({ rows }: { rows: any[] }) => <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{rows.map((v) => <Link key={v.slug} href={`/teachings/videos/${v.slug}`} className="group">{(v.thumb || v.youtube_id) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={v.thumb || ytThumb(v.youtube_id)} alt="" loading="lazy" className="aspect-video w-full rounded-lg bg-band object-cover transition group-hover:opacity-90" />}<span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug text-ink group-hover:text-saffron">{v.title}</span>{v.date && <span className="text-[11.5px] text-ink-3">{fmtDate(v.date)}</span>}</Link>)}</div>;
const Moments = ({ rows, year }: { rows: any[]; year?: boolean }) => <ol className="divide-y divide-line rounded-lg border border-line">{rows.map((m) => <li key={m.slug}><Link href={`/gurudeva/timeline#m-${m.slug}`} className="flex gap-4 px-4 py-3 hover:bg-band/50">{m.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.image} alt="" loading="lazy" className="size-14 shrink-0 rounded-md object-cover" />}<span className="min-w-0"><span className="block text-[11.5px] font-medium text-saffron">{m.date_label || (year && m.year) || ""}</span><span className="block text-[14px] font-medium text-ink">{m.title}</span>{m.summary && <span className="mt-0.5 line-clamp-2 block text-[12.5px] text-ink-2">{m.summary}</span>}</span></Link></li>)}</ol>;
const Letters = ({ rows }: { rows: any[] }) => <ul className="divide-y divide-line rounded-lg border border-line">{rows.map((x) => <li key={x.slug}><Link href={archiveHref(x.collection, x.slug)} className="flex items-baseline justify-between gap-3 px-4 py-2.5 hover:bg-band/50"><span className="min-w-0 truncate text-[13.5px] text-ink">{x.title}</span><span className="shrink-0 text-[11.5px] text-ink-3">{x.date_label || (x.date ? fmtDate(x.date) : "")}</span></Link></li>)}</ul>;
const Diary = ({ rows }: { rows: any[] }) => <ul className="flex flex-wrap gap-2">{rows.map((x) => <li key={x.slug}><Link href={`/gurudeva/diaries/${x.slug}`} className="inline-flex rounded-full border border-line px-3 py-1 text-[12.5px] text-ink-2 hover:border-ink-3 hover:text-ink">{x.title || (x.date ? fmtDate(x.date) : x.slug)}</Link></li>)}</ul>;

/* ---------------- Verses ---------------- */
export async function VersesIndex({ s }: { s?: string }) {
  const { rows } = await verseIndex();
  const by = new Map<string, any[]>(); rows.forEach((r) => { const k = String(r.scripture).toUpperCase(); by.set(k, [...(by.get(k) || []), r]); });
  const keys = [...by.keys()].sort((a, b) => Object.keys(SCRIPTURES).indexOf(a) - Object.keys(SCRIPTURES).indexOf(b));
  const pick = s && by.has(s.toUpperCase()) ? s.toUpperCase() : keys[0];
  const list = pick ? by.get(pick)! : [];
  const groups = new Map<string, any[]>(); list.forEach((r) => { const g = pick === "CC" ? (CC_LILA[r.canto] || "Other") : pick === "BG" ? `Chapter ${r.chapter ?? r.canto ?? "—"}` : r.canto ? `Canto ${r.canto}` : "Other"; groups.set(g, [...(groups.get(g) || []), r]); });
  const ref = (r: any) => [r.canto, r.chapter, r.verse].filter((x) => x != null && x !== "").join(".");
  return (
    <>
      <IndexNav at="verses" />
      <Head title="Verse index" intro="The verses Śrīla Gurudeva spoke on, scripture by scripture — open a verse to hear every lecture given on it." stats={[plural(rows.length, "lecture"), plural(keys.length, "scripture")]} />
      {!rows.length ? <Empty text="Lectures will be listed here verse by verse as their scripture references are prepared." /> : <>
        <div className="mb-6 flex flex-wrap gap-2">{keys.map((k) => <Link key={k} href={`/tattva/index/verses?s=${k}`} className={`rounded-xl border px-4 py-2.5 text-left transition ${k === pick ? "border-saffron bg-saffron/[0.06]" : "border-line hover:border-ink-3"}`}><span className="block text-[14px] font-medium text-ink">{SCRIPTURES[k] || k}</span><span className="text-[12px] text-ink-3">{plural(by.get(k)!.length, "lecture")}</span></Link>)}</div>
        {[...groups.entries()].map(([g, rs]) => { const verses = new Map<string, any[]>(); rs.forEach((r) => { const k = ref(r) || "—"; verses.set(k, [...(verses.get(k) || []), r]); }); return (
          <Block key={g} title={g} n={rs.length}>
            <div className="divide-y divide-line rounded-lg border border-line">{[...verses.entries()].map(([v, ls]) => (
              <details key={v} className="group" open={verses.size <= 3}>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 hover:bg-band/50"><ChevronRight size={14} className="shrink-0 text-ink-3 transition group-open:rotate-90" /><span className="w-24 shrink-0 font-medium tabular-nums text-ink">{pick} {v}</span><span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{ls[0].title}</span><span className="shrink-0 text-[12px] text-ink-3">{plural(ls.length, "lecture")}</span></summary>
                <div className="border-t border-line bg-band/20 px-3"><Lectures rows={ls} /></div>
              </details>))}</div>
          </Block>); })}
      </>}
    </>);
}

/* ---------------- Years ---------------- */
export async function YearsIndex({ y }: { y?: number }) {
  const years = await yearIndex(); const pick = y && years.some((r) => r.y === y) ? y : null;
  const max = Math.max(1, ...years.map((r) => r.lectures + r.videos + r.moments + r.letters + r.diary + r.issues));
  const sum = (r: (typeof years)[number]) => r.lectures + r.videos + r.moments + r.letters + r.diary + r.issues;
  const decades = [...new Set(years.map((r) => Math.floor(r.y / 10) * 10))];
  if (pick) {
    const it = await yearItems(pick); const i = years.findIndex((r) => r.y === pick); const prev = years[i - 1], next = years[i + 1];
    return (
      <>
        <IndexNav at="years" />
        <Link href="/tattva/index/years" className="text-[12.5px] text-ink-3 hover:text-ink">← All years</Link>
        <Head title={String(pick)} intro={`Everything from ${pick} in the archive: his life, lectures, videos, letters, diary and magazines.`} stats={[it.moments.length ? plural(it.moments.length, "life moment") : "", it.lectures.length ? plural(it.lectures.length, "lecture") : "", it.videos.length ? plural(it.videos.length, "video") : "", it.letters.length ? plural(it.letters.length, "letter or document") : "", it.diary.length ? plural(it.diary.length, "diary page") : "", it.issues.length ? plural(it.issues.length, "issue") : ""]} />
        {it.moments.length > 0 && <Block title="In his life" n={it.moments.length}><Moments rows={it.moments} /></Block>}
        {it.lectures.length > 0 && <Block title="Lectures" n={it.lectures.length}><Lectures rows={it.lectures} /></Block>}
        {it.videos.length > 0 && <Block title="Videos" n={it.videos.length}><Videos rows={it.videos} /></Block>}
        {it.letters.length > 0 && <Block title="Letters & documents" n={it.letters.length}><Letters rows={it.letters} /></Block>}
        {it.diary.length > 0 && <Block title="His diary" n={it.diary.length}><Diary rows={it.diary} /></Block>}
        {it.issues.length > 0 && <Block title="Magazine issues" n={it.issues.length}><div className="grid grid-cols-3 gap-4 sm:grid-cols-6">{it.issues.map((x: any) => <Link key={x.slug} href={`/teachings/magazines/${x.mslug}/${x.slug}`} className="group">{x.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.cover} alt="" loading="lazy" className="aspect-[3/4] w-full rounded-sm object-cover shadow-sm" />}<span className="mt-1 line-clamp-2 block text-[12px] text-ink-2 group-hover:text-ink">{[x.number, x.title].filter(Boolean).join(" · ")}</span></Link>)}</div></Block>}
        <nav className="mt-10 flex justify-between border-t border-line pt-4 text-[13px]">{prev ? <Link href={`/tattva/index/years?y=${prev.y}`} className="text-ink-2 hover:text-ink">← {prev.y}</Link> : <span />}{next ? <Link href={`/tattva/index/years?y=${next.y}`} className="text-ink-2 hover:text-ink">{next.y} →</Link> : <span />}</nav>
      </>);
  }
  return (
    <>
      <IndexNav at="years" />
      <Head title="Years" intro="Choose a year to see what the archive holds from it — moments of his life, lectures, videos, letters, diary pages and magazines." stats={[years.length ? `${years[0].y}–${years[years.length - 1].y}` : "", plural(years.length, "year")]} />
      {!years.length ? <Empty text="Years appear here as dated lectures, videos and life moments are added." /> : decades.map((d) => (
        <Block key={d} title={`${d}s`}>
          <div className="grid gap-2 sm:grid-cols-2">{years.filter((r) => Math.floor(r.y / 10) * 10 === d).map((r) => (
            <Link key={r.y} href={`/tattva/index/years?y=${r.y}`} className="group rounded-lg border border-line px-4 py-3 transition hover:border-ink-3">
              <span className="flex items-baseline justify-between"><span className="text-[17px] font-semibold tabular-nums text-ink group-hover:text-saffron">{r.y}</span><span className="text-[12px] text-ink-3">{plural(sum(r), "item")}</span></span>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-band"><span className="block h-full rounded-full bg-saffron/70" style={{ width: `${Math.max(4, (sum(r) / max) * 100)}%` }} /></span>
              <span className="mt-1.5 block text-[12px] text-ink-3">{[r.moments && plural(r.moments, "moment"), r.lectures && plural(r.lectures, "lecture"), r.videos && plural(r.videos, "video"), r.letters && plural(r.letters, "letter"), r.diary && plural(r.diary, "diary page"), r.issues && plural(r.issues, "issue")].filter(Boolean).join(" · ")}</span>
            </Link>))}</div>
        </Block>))}
    </>);
}

/* ---------------- Places ---------------- */
export async function PlacesIndex({ p }: { p?: string }) {
  const places = await placeIndex(); const pick = p ? places.find((x) => x.slug === p) : null;
  const total = (x: (typeof places)[number]) => x.lectures + x.videos + x.moments + x.letters + x.diary;
  if (pick) {
    const it = await placeItems(pick.place);
    return (
      <>
        <IndexNav at="places" />
        <Link href="/tattva/index/places" className="text-[12.5px] text-ink-3 hover:text-ink">← All places</Link>
        <Head title={pick.place} intro={[pick.country, pick.first ? (pick.first === pick.last ? String(pick.first) : `${pick.first}–${pick.last}`) : null].filter(Boolean).join(" · ") || "Everything from this place in the archive."} stats={[it.moments.length ? plural(it.moments.length, "life moment") : "", it.lectures.length ? plural(it.lectures.length, "lecture") : "", it.videos.length ? plural(it.videos.length, "video") : "", it.letters.length ? plural(it.letters.length, "letter or document") : ""]} />
        {it.moments.length > 0 && <Block title="In his life" n={it.moments.length}><Moments rows={it.moments} year /></Block>}
        {it.lectures.length > 0 && <Block title="Lectures given here" n={it.lectures.length}><Lectures rows={it.lectures} /></Block>}
        {it.videos.length > 0 && <Block title="Videos" n={it.videos.length}><Videos rows={it.videos} /></Block>}
        {it.letters.length > 0 && <Block title="Letters & documents" n={it.letters.length}><Letters rows={it.letters} /></Block>}
        {it.diary.length > 0 && <Block title="His diary" n={it.diary.length}><Diary rows={it.diary} /></Block>}
      </>);
  }
  const countries = [...new Set(places.map((x) => x.country || "Other places"))].sort((a, b) => (a === "Other places" ? 1 : b === "Other places" ? -1 : a.localeCompare(b)));
  return (
    <>
      <IndexNav at="places" />
      <Head title="Places" intro="Where Śrīla Gurudeva lived, spoke, travelled and wrote from. Open a place to see everything from it." stats={[plural(places.length, "place"), plural(countries.filter((c) => c !== "Other places").length, "country")]} />
      {!places.length ? <Empty text="Places appear here as lectures, videos and life moments with a place are added." /> : countries.map((c) => { const ps = places.filter((x) => (x.country || "Other places") === c); return (
        <Block key={c} title={c} n={ps.length}>
          <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">{ps.map((x) => <Link key={x.slug} href={`/tattva/index/places?p=${x.slug}`} className="flex items-baseline justify-between gap-2 border-b border-line/70 py-2 text-[13.5px] text-ink-2 hover:text-saffron"><span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin size={12} className="shrink-0 text-ink-3" />{x.place}</span><span className="shrink-0 text-[11.5px] text-ink-3">{total(x)}</span></Link>)}</div>
        </Block>); })}
    </>);
}

/* ---------------- People ---------------- */
export async function PeopleIndex({ who }: { who?: string }) {
  const people = await peopleIndex(); const pick = who ? people.find((x) => x.slug === who) : null;
  if (pick) {
    const it = await personItems(pick.name);
    return (
      <>
        <IndexNav at="people" />
        <Link href="/tattva/index/people" className="text-[12.5px] text-ink-3 hover:text-ink">← All people</Link>
        <Head title={pick.name} intro={pick.years.length ? `In the archive: ${pick.years.length === 1 ? pick.years[0] : `${pick.years[0]}–${pick.years[pick.years.length - 1]}`}` : "In the archive"} stats={[it.moments.length ? plural(it.moments.length, "life moment") : "", it.letters.length ? plural(it.letters.length, "letter or document") : ""]} />
        {it.moments.length > 0 && <Block title="In Śrīla Gurudeva’s life" n={it.moments.length}><Moments rows={it.moments} year /></Block>}
        {it.letters.length > 0 && <Block title="Letters & documents" n={it.letters.length}><Letters rows={it.letters} /></Block>}
      </>);
  }
  const groups = people.reduce<Record<string, typeof people>>((a, x) => { const L = fold(x.name)[0]?.toUpperCase() || "#"; (a[/[A-Z]/.test(L) ? L : "#"] ||= []).push(x); return a; }, {});
  return (
    <>
      <IndexNav at="people" />
      <Head title="People" intro="The personalities in Śrīla Gurudeva’s life — his spiritual master, godbrothers, disciples and others — with the moments and letters they appear in." stats={[plural(people.length, "person")]} />
      {!people.length ? <Empty text="People appear here as they are named in the life timeline and in letters." /> : <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">{Object.keys(groups).sort().map((L) => <div key={L} className="mb-5 break-inside-avoid"><p className="mb-1 text-[12px] font-semibold text-ink-3">{L}</p>{groups[L].map((x) => <Link key={x.slug} href={`/tattva/index/people?who=${x.slug}`} className="flex justify-between rounded px-1.5 py-1 text-[13.5px] text-ink-2 hover:bg-band hover:text-ink"><span>{x.name}</span><span className="text-[11.5px] text-ink-3">{x.moments + x.letters}</span></Link>)}</div>)}</div>}
    </>);
}

/* ---------------- Glossary ---------------- */
export function GlossaryIndex() {
  return (
    <>
      <IndexNav at="glossary" />
      <Head title="Glossary" intro="Sanskrit, Bengali and Odia words as Śrīla Gurudeva used them, explained in his own words, with where he spoke them." />
      <Empty text="The glossary is being prepared from his lectures and books. Each word will come with his own explanation and its source — nothing will be added without it." />
    </>);
}

/* ---------------- A–Z ---------------- */
export async function AZIndex({ k, l }: { k?: string; l?: string }) {
  const all = await azIndex(); const kinds = [...new Set(all.map((x) => x.kind))];
  const list = k && kinds.includes(k) ? all.filter((x) => x.kind === k) : all;
  const letter = (t: string) => { const L = fold(t)[0]?.toUpperCase() || "#"; return /[A-Z]/.test(L) ? L : "#"; };
  const letters = [...new Set(list.map((x) => letter(x.title)))].sort();
  const L = l && letters.includes(l.toUpperCase()) ? l.toUpperCase() : letters[0];
  const shown = list.filter((x) => letter(x.title) === L);
  const href = (p: { k?: string | null; l?: string | null }) => { const u = new URLSearchParams(); const kk = p.k === undefined ? k : p.k; const ll = p.l === undefined ? l : p.l; if (kk) u.set("k", kk); if (ll) u.set("l", ll); const s = u.toString(); return `/tattva/index/a-z${s ? `?${s}` : ""}`; };
  return (
    <>
      <IndexNav at="a-z" />
      <Head title="A–Z" intro="Everything in the archive, alphabetically: topics, books, lectures, videos, articles, magazines, life moments and documents." stats={[plural(all.length, "entry")]} />
      {!all.length ? <Empty text="Entries appear here as content is published." /> : <>
        <div className="mb-3 flex flex-wrap gap-1.5"><Link href={href({ k: null, l: null })} className={`rounded-full px-3 py-1 text-[12.5px] ${!k ? "bg-ink text-white" : "border border-line text-ink-2 hover:border-ink-3"}`}>Everything <span className="opacity-60">{all.length}</span></Link>{kinds.map((x) => <Link key={x} href={href({ k: x, l: null })} className={`rounded-full px-3 py-1 text-[12.5px] ${k === x ? "bg-ink text-white" : "border border-line text-ink-2 hover:border-ink-3"}`}>{x}s <span className="opacity-60">{all.filter((y) => y.kind === x).length}</span></Link>)}</div>
        <div className="sticky top-[52px] z-10 -mx-1 flex flex-wrap gap-0.5 bg-white/95 px-1 py-2 backdrop-blur sm:top-[58px]">{"#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((x) => letters.includes(x) ? <Link key={x} href={href({ l: x })} className={`flex size-7 items-center justify-center rounded text-[12.5px] ${x === L ? "bg-ink font-semibold text-white" : "text-ink-2 hover:bg-band"}`}>{x}</Link> : <span key={x} className="flex size-7 items-center justify-center text-[12.5px] text-ink-3/40">{x}</span>)}</div>
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">{shown.map((x) => <li key={x.kind + x.href}><Link href={x.href} className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-band/50"><span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-3">{x.kind}</span><span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{x.title}</span>{x.sub && <span className="hidden shrink-0 text-[12px] text-ink-3 sm:inline">{x.sub}</span>}</Link></li>)}</ul>
      </>}
    </>);
}
