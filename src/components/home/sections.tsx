/* New home page sections, in the owner's design language: tracked saffron kickers, semibold headings,
   two-column sections with a living preview beside the words, soft cream bands, pill buttons. */
import Link from "next/link";
import { ArrowRight, Headphones, Music2, Video, BookOpen, Quote, Network, NotebookPen, Image as ImageIcon, Mail, HandHeart, MapPin, Gift, History, Search, Languages, Keyboard, Columns2, FileText, Newspaper, HeartHandshake, type LucideIcon } from "lucide-react";
import { durText } from "@/lib/content/text";
import { LiveNumbers, BlessingLetters, TopicCloud } from "./live";

export function Kicker({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <p className={`mb-3 text-[11.5px] font-medium uppercase tracking-[0.3em] text-saffron ${center ? "text-center" : ""}`}>{children}</p>;
}
export function Divider({ w = "w-1/2 max-w-md" }: { w?: string }) {
  return <div aria-hidden className={`mx-auto my-10 flex items-center gap-2 ${w}`}><span className="h-1 w-2.5 shrink-0 rounded-full bg-[#c2621d]" /><span className="h-px flex-1 bg-gradient-to-r from-[#c2621d]/60 via-[#c2621d]/25 to-[#c2621d]/60" /><span className="h-1 w-2.5 shrink-0 rounded-full bg-[#c2621d]" /></div>;
}
const PillSolid = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-[14px] font-medium text-white transition hover:opacity-90">{children}</Link>;
const PillLine = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="inline-flex items-center gap-2 rounded-full border border-[#e6d6b8] px-6 py-3 text-[14px] text-ink transition hover:border-saffron hover:text-saffron">{children}</Link>;
const Dots = ({ items }: { items: [string, string][] }) => (
  <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{items.map(([t, d]) => <li key={t} className="relative pl-4"><span className="absolute left-0 top-[7px] size-1.5 rounded-full bg-[#c2621d]" /><p className="text-[14.5px] font-medium text-ink">{t}</p><p className="text-[13.5px] leading-snug text-ink-2">{d}</p></li>)}</ul>
);
const BAND = "border-y border-[#efe4cf] bg-[#fbf7ef]";

/* ------------------------------------------------------------------ blessing */
export function BlessingSection() {
  return (
    <section className={`reveal ${BAND}`}>
      <div className="mx-auto max-w-5xl px-5 py-16">
        <Kicker center>Śrīla Prabhupāda on Śrīla Gurudeva</Kicker>
        <h2 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[36px]">“Kṛṣṇa sent him.”</h2>
        <p className="mt-2 text-center text-[13px] text-ink-3">Room conversation, Bombay, 5 January 1977</p>
        <div aria-hidden className="mx-auto mt-4 flex w-40 items-center gap-2 text-[10px] text-[#c2621d]"><span className="h-px flex-1 bg-[#c2621d]/40" />◆<span className="h-px flex-1 bg-[#c2621d]/40" /></div>
        <BlessingLetters />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ numbers */
export function NumbersSection({ items }: { items: { n: number; label: string; sub: string }[] }) {
  return (
    <section className="reveal mx-auto max-w-6xl px-5 py-16">
      <Kicker center>All in one place</Kicker>
      <h2 className="mx-auto mb-10 max-w-3xl text-center text-[24px] font-semibold leading-snug tracking-[-0.015em] text-ink sm:text-[30px]">The teachings of Śrīla Prabhupāda and Śrīla Gurudeva — heard, read and searched in one place</h2>
      <LiveNumbers items={items} />
    </section>
  );
}

/* ------------------------------------------------------------------ listen */
export type HomeLecture = { slug: string; title: string; date: string | null; place: string | null; duration_sec: number | null; transcript_status: string | null };
export function ListenSection({ lectures, counts }: { lectures: HomeLecture[]; counts: { lectures: number; kirtans: number; videos: number; transcripts: number } }) {
  return (
    <section className={`reveal ${BAND}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Kicker>Hari-kathā in his own voice</Kicker>
          <h2 className="mb-4 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">Listen, watch, and read along</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-2">Lectures, darśanas and kīrtanas from 1985 to 1996, sorted by year, place, scripture and type — many with a full transcription you can follow as he speaks.</p>
          <Dots items={[["By year and place", "Bhubaneswar, Vṛndāvana, Māyāpur and around the world"], ["By scripture", "Bhāgavatam, Gītā, Caitanya-caritāmṛta — verse by verse"], ["Read along", `${counts.transcripts.toLocaleString()} transcriptions, searchable`], ["Keep listening", "A player that stays with you across the site"]]} />
          <div className="mt-8 flex flex-wrap gap-3"><PillSolid href="/teachings/audio">Audio lectures <ArrowRight size={16} /></PillSolid><PillLine href="/teachings/kirtans">Kīrtanas</PillLine><PillLine href="/teachings/videos">Videos</PillLine></div>
        </div>
        <div className="rounded-2xl border border-[#eadcc0] bg-white p-2 shadow-[0_20px_50px_-30px_rgba(120,60,10,0.35)]">
          <div className="flex items-center justify-between px-4 pb-2 pt-3"><p className="text-[12.5px] font-medium text-saffron">Recently added</p><div className="flex gap-3 text-[11.5px] text-ink-3"><span className="flex items-center gap-1"><Headphones size={13} />{counts.lectures.toLocaleString()}</span><span className="flex items-center gap-1"><Music2 size={13} />{counts.kirtans.toLocaleString()}</span><span className="flex items-center gap-1"><Video size={13} />{counts.videos.toLocaleString()}</span></div></div>
          <ul className="divide-y divide-[#f1e7d4]">{lectures.slice(0, 6).map((l) => (
            <li key={l.slug}><Link href={`/teachings/audio/${l.slug}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#fbf7ef]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#eadcc0] text-saffron transition group-hover:bg-saffron group-hover:text-white"><Headphones size={15} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium text-ink">{l.title}</span><span className="block truncate text-[12px] text-ink-3">{[l.date ? String(l.date).slice(0, 10) : null, l.place].filter(Boolean).join(" · ")}</span></span>
              {l.transcript_status === "done" && <span className="hidden rounded-full bg-[#fbf0d2] px-2 py-0.5 text-[10.5px] font-medium text-[#8a5a00] sm:inline">Transcript</span>}
              <span className="w-12 text-right text-[12px] tabular-nums text-ink-3">{durText(l.duration_sec)}</span>
            </Link></li>))}
            {!lectures.length && <li className="px-4 py-10 text-center text-[13px] text-ink-3">Lectures appear here as they are added.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ read */
export type HomeBook = { slug: string; title: string; cover_url: string | null; language: string };
export function ReadSection({ books, total }: { books: HomeBook[]; total: number }) {
  return (
    <section className="reveal relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="order-2 rounded-3xl border border-[#efe4cf] bg-[#fbf7ef] p-6 shadow-[0_20px_50px_-30px_rgba(120,60,10,0.3)] lg:order-1">
          <p className="mb-4 text-center text-[11.5px] font-semibold uppercase tracking-[0.25em] text-ink-3">On the shelf</p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">{books.slice(0, 8).map((b) => (
            <Link key={b.slug} href={`/books/${b.slug}`} className="group">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[2px_6px_6px_2px] bg-gradient-to-br from-[#7a3a10] to-[#3f1a05] shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition group-hover:-translate-y-1">
                {b.cover_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_url} alt={b.title} loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center p-2 text-center text-[11px] leading-snug text-[#f3d9a4]" style={{ fontFamily: "var(--font-reading-serif)" }}>{b.title}</span>}
                <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent" />
              </span>
              <span className="mt-1.5 block truncate text-[11.5px] text-ink-2">{b.title}</span>
            </Link>))}
            {!books.length && <p className="col-span-full py-10 text-center text-[13px] text-ink-3">Books appear here as they are added.</p>}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Kicker>Books</Kicker>
          <h2 className="mb-4 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">Read his books, the way you like to read</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-2">{total ? `${total} ${total === 1 ? "book" : "books"}` : "Books"} to read right here, chapter by chapter — and the same book in other languages as translations are added.</p>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{([[BookOpen, "Four readers", "Classic, Focus, Pages, or two languages side by side"], [Languages, "Every translation", "Switch language in the middle of a chapter"], [Search, "Find in a book", "Any word, in any chapter, in a moment"], [Keyboard, "Made for reading", "Night colours, font size, shortcuts, bookmarks"]] as [LucideIcon, string, string][]).map(([I, t, d]) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fbf0d2] text-[#8a5a00]"><I size={15} /></span><span><span className="block text-[14.5px] font-medium text-ink">{t}</span><span className="block text-[13.5px] leading-snug text-ink-2">{d}</span></span></li>)}</ul>
          <div className="mt-8 flex flex-wrap gap-3"><PillSolid href="/teachings/books">Open the library <ArrowRight size={16} /></PillSolid><PillLine href="/gurudeva/who-is-srila-gurudeva">Books about him</PillLine></div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ tattva */
export function TattvaSection({ topics, quotes }: { topics: { name: string; slug: string; total: number }[]; quotes: number }) {
  return (
    <section className={`reveal ${BAND}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_1fr]">
        <div>
          <Kicker>Tattva</Kicker>
          <h2 className="mb-4 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">Follow one subject through everything he said</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-2">Open a topic — Guru-tattva, the Holy Name, separation — and find his quotes, lectures, videos and articles on it together, each with its exact source.</p>
          <div className="grid gap-3 sm:grid-cols-2">{([[Network, "Topics A–Z", "Every tattva in one collapsible list", "/tattva"], [Quote, "Quotes", quotes ? `${quotes.toLocaleString()} quotes, by topic and letter` : "By topic and letter", "/teachings/quotes"], [FileText, "Instructions & desires", "His guidance, in his own words", "/teachings/instructions"], [Search, "Search everything", "A word, a verse, a place or a year", "/search"]] as [LucideIcon, string, string, string][]).map(([I, t, d, h]) => (
            <Link key={t} href={h} className="group rounded-2xl border border-[#eadcc0] bg-white p-4 transition hover:border-saffron"><span className="mb-3 flex size-9 items-center justify-center rounded-full border border-[#eadcc0] text-saffron"><I size={16} /></span><span className="block text-[14.5px] font-medium text-ink group-hover:text-saffron">{t}</span><span className="mt-0.5 block text-[12.5px] leading-snug text-ink-2">{d}</span></Link>))}</div>
        </div>
        <div className="rounded-3xl border border-[#eadcc0] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(120,60,10,0.3)]">
          <p className="mb-4 text-[12.5px] font-medium text-saffron">Open a topic</p>
          <TopicCloud topics={topics} />
          <Link href="/tattva" className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-saffron">All topics, A–Z <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ gurudeva */
export function GurudevaSection() {
  const links: [string, LucideIcon, string][] = [["/gurudeva/who-is-srila-gurudeva", HandHeart, "Who is Śrīla Gurudeva"], ["/gurudeva/timeline", History, "Life timeline"], ["/gurudeva/diaries", NotebookPen, "His diary to Śrī Gopāl Jiu"], ["/gurudeva/memories", HeartHandshake, "Memories & pastimes"], ["/gurudeva/glorifications", Gift, "Glorifications"], ["/gurudeva/letters", Mail, "Letters"], ["/gurudeva/gallery", ImageIcon, "Gallery"], ["/gurudeva/places-of-remembrance", MapPin, "Places of remembrance"]];
  return (
    <section className="reveal">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-[1.25rem] p-[6px] shadow-2xl" style={{ background: "linear-gradient(135deg, #e8c766 0%, #c2621d 45%, #8a1c0f 100%)" }}>
            <div className="overflow-hidden rounded-[1rem] border border-black/20 bg-[#fbf7ef]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/gurudeva-garland.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="block aspect-[4/5] w-full object-cover object-top" loading="lazy" />
            </div>
          </div>
          <p className="mt-4 text-center text-[13px] text-ink-3">Śrī Śrīmad Gour Govinda Swāmī Gurudeva</p>
        </div>
        <div>
          <Kicker>Śrīla Gurudeva</Kicker>
          <h2 className="mb-4 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">A dear disciple of Śrīla Prabhupāda</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-2">Born in a family devoted to Śrī Gopāl Jiu, he carried his Guru’s mission across Odisha and the world. Here his life is remembered — by those who knew him, in his own diary, and in photographs.</p>
          <div className="grid gap-2 sm:grid-cols-2">{links.map(([h, I, l]) => <Link key={h} href={h} className="group flex items-center gap-3 rounded-xl border border-[#efe4cf] px-3.5 py-2.5 transition hover:border-saffron hover:bg-[#fbf7ef]"><I size={16} className="shrink-0 text-saffron" /><span className="flex-1 text-[13.5px] text-ink">{l}</span><ArrowRight size={14} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-saffron" /></Link>)}</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ everything */
export function EverythingSection() {
  const all: [string, LucideIcon, string, string][] = [
    ["/teachings/audio", Headphones, "Audio lectures", "By year, place, scripture and type, with transcriptions."],
    ["/teachings/kirtans", Music2, "Kīrtanas & bhajanas", "Songs he sang, by song, author and place."],
    ["/teachings/videos", Video, "Videos", "Every video from the channels, sorted for you."],
    ["/teachings/books", BookOpen, "Books", "Four readers, translations, search inside."],
    ["/teachings/articles", FileText, "Articles", "Essays and compilations by many authors."],
    ["/teachings/magazines", Newspaper, "Magazines", "Issues of the magazines, to read online."],
    ["/teachings/quotes", Quote, "Compilations", "Quotes, instructions, desires, verses and stories."],
    ["/tattva", Network, "Tattva", "Every subject, with everything said on it."],
    ["/webfolio", Columns2, "WebFolio", "The whole archive as one document — offline too."],
  ];
  return (
    <section className={`reveal ${BAND}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Kicker center>On this website</Kicker>
        <h2 className="mb-10 text-center text-[24px] font-semibold tracking-[-0.015em] text-ink sm:text-[32px]">Everything, in one place</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{all.map(([h, I, t, d]) => (
          <Link key={h} href={h} className="group flex gap-4 rounded-2xl border border-[#eadcc0] bg-white p-5 transition hover:border-saffron hover:shadow-[0_14px_30px_-20px_rgba(120,60,10,0.4)]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-saffron"><I size={18} /></span>
            <span><span className="block text-[15px] font-medium text-ink group-hover:text-saffron">{t}</span><span className="mt-1 block text-[13px] leading-snug text-ink-2">{d}</span></span>
          </Link>))}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ thanks */
export function ThanksSection() {
  return (
    <section className="reveal mx-auto max-w-3xl px-5 py-16 text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-saffron"><HeartHandshake size={22} /></span>
      <Kicker center>With gratitude</Kicker>
      <h2 className="text-[24px] font-semibold tracking-[-0.015em] text-ink sm:text-[30px]">Our Thank List</h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
      <div className="mt-7 flex justify-center"><PillLine href="/thank-list">Read the Thank List <ArrowRight size={16} /></PillLine></div>
    </section>
  );
}
