/* New home page sections, in the owner's design language: tracked saffron kickers, semibold headings,
   two-column sections with a living preview beside the words, soft cream bands, pill buttons. */
import Link from "next/link";
import { ArrowRight, Headphones, Music2, Video, BookOpen, Quote, Network, NotebookPen, Image as ImageIcon, Mail, HandHeart, MapPin, Gift, History, Search, Languages, Keyboard, Columns2, FileText, Newspaper, HeartHandshake, Download, WifiOff, MonitorDown, ChevronRight, type LucideIcon } from "lucide-react";
import { durText } from "@/lib/content/text";
import { LiveNumbers, BlessingLetters, TopicCloud } from "./live";
import { Backdrop } from "@/components/backdrop";

export function Kicker({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <p className={`mb-3 text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px] sm:tracking-[0.3em] ${center ? "text-center" : ""}`}>{children}</p>;
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
  const frame = (src: string, alt: string, name: string, line: string, delay: string) => (
    <figure className="bless-rise group" style={{ animationDelay: delay }}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="relative z-10 mx-auto block aspect-[4/5] w-full object-contain object-bottom transition duration-700 group-hover:-translate-y-1.5" loading="lazy" />
        <span aria-hidden className="absolute inset-x-[12%] -bottom-1 h-4 rounded-[50%] bg-black/10 blur-md" />
      </div>
      <figcaption className="mt-4 text-center"><span className="mx-auto mb-2 block h-px w-12 bg-gradient-to-r from-transparent via-[#c2621d] to-transparent" /><span className="block text-[14px] font-semibold text-ink sm:text-[15px]">{name}</span><span className="block text-[11.5px] text-ink-3 sm:text-[12px]">{line}</span></figcaption>
    </figure>
  );
  return (
    <section className="reveal relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-5xl px-4 py-12 text-center sm:px-5 sm:py-16">
        <p className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.25em] text-saffron sm:text-[11.5px] sm:tracking-[0.3em]">Śrīla Prabhupāda on Śrīla Gurudeva</p>
        <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[46px]">{["“Kṛṣṇa", "sent", "him.”"].map((w, i) => <span key={i} className="bless-word inline-block" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>{w}&nbsp;</span>)}</h2>
        <p className="mt-2 text-[12px] text-ink-3 sm:text-[13px]">Room conversation, Bombay, 5 January 1977</p>
        <div className="mx-auto mt-8 grid max-w-[760px] grid-cols-2 items-end gap-4 sm:mt-10 sm:gap-10">
          {frame("/legacy/prabhupada.webp", "Śrīla A.C. Bhaktivedanta Swami Prabhupāda", "Śrīla Prabhupāda", "Founder-ācārya of ISKCON", "0.2s")}
          {frame("/legacy/gurudeva.webp", "Śrī Śrīmad Gour Govinda Swāmī Gurudeva", "Śrīla Gurudeva", "His dear disciple", "0.35s")}
        </div>
        <div aria-hidden className="mx-auto mt-8 flex w-40 items-center gap-2 text-[9px] text-[#c2621d]"><span className="h-px flex-1 bg-[#c2621d]/40" />◆<span className="h-px flex-1 bg-[#c2621d]/40" /></div>
        <p className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-ink-2 sm:text-[19px]" style={{ fontFamily: "var(--font-reading-serif)" }}>“Krishna is with you and there is no need of disappointment.”</p>
        <p className="mt-1.5 text-[12px] text-ink-3 sm:text-[12.5px]">Śrīla Prabhupāda’s letter to Śrīla Gurudeva, Māyāpur, 12 February 1976</p>
        <BlessingLetters />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ founder */
const FOUNDER_STEPS: [string, string, string][] = [
  ["1992", "Joins ISKCON Bhubaneswar", "Comes into contact with the devotees at ISKCON Bhubaneswar and begins to join their service."],
  ["1994", "Initiation", "Initiated as Halāyudha Dāsa. Serves in the travelling saṅkīrtana party and as head pūjārī of Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2016", "Sannyāsa", "Accepts the renounced order on 20 March 2016, from His Holiness Rādhā-Govinda Swāmī Mahārāja, at Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2019", "The wish for one digital home", "During his European tour, at ISKCON New Māyāpura, he expressed his cherished desire to create a platform where all the audio lectures of his spiritual master would be available to everyone."],
  ["2020", "Small clips, every day", "With the help of his disciples and followers he began curating daily selections of quotes and lectures, turned into small audio clips that capture the essence of Gurudeva’s teachings."],
  ["Today", "Simple living, high thinking", "Emphasises serving the spiritual master (śrī guru-sevā) and chanting the holy names (śrī nāma-sevā) without compromise."],
];
export function FounderNew() {
  return (
    <section className="reveal">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Kicker>The founder</Kicker>
          <h2 className="mb-6 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">How Taptajīvanam began</h2>
          <figure className="relative">
            <div className="relative mx-auto max-w-[340px] lg:mx-0">
              <div className="overflow-hidden rounded-[1.25rem] p-[5px] shadow-[0_26px_50px_-28px_rgba(90,30,0,0.55)]" style={{ background: "linear-gradient(135deg, #e8c766 0%, #c2621d 45%, #8a1c0f 100%)" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="block aspect-[4/4.4] w-full rounded-[1rem] object-cover object-top" /></div>
              <figcaption className="absolute inset-x-4 -bottom-6 rounded-xl border border-[#eadcc0] bg-white/95 px-4 py-3 text-center shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
                <p className="text-[15px] font-semibold leading-snug text-ink sm:text-[16px]">Śrīla Haladhara Swāmī Guru Mahārāja</p>
                <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-saffron">Founder of Taptajīvanam</p>
              </figcaption>
            </div>
            <p className="mt-12 text-[14px] leading-relaxed text-ink-2">ISKCON Guru and Sannyāsī — he travels and preaches Kṛṣṇa consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
            <dl className="mt-5 divide-y divide-[#efe4cf] border-y border-[#efe4cf] text-[13.5px]">{[["Disciple of", "Śrīla Gurudeva"], ["Grand-disciple of", "Śrīla Prabhupāda"], ["Preaches in", "Odia · Hindi · English"], ["His service", "Śrī Guru Sevā · Śrī Nāma Sevā"]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-3">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>)}</dl>
          </figure>
          <Link href="/about/founder" className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-medium text-saffron">Read his biography <ArrowRight size={14} /></Link>
        </div>
        <ol className="relative">
          <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-[#e8c766] via-[#c2621d]/60 to-[#e8c766]" />
          {FOUNDER_STEPS.map(([y, t, d], i) => (
            <li key={y} className="relative flex gap-5 pb-5 last:pb-0">
              <span className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums ${i === 3 ? "border-transparent bg-saffron text-white shadow-[0_8px_20px_-8px_rgba(133,53,0,0.7)]" : "border-[#eadcc0] bg-white text-saffron"}`}>{y}</span>
              <div className={`flex-1 rounded-2xl border p-5 transition hover:border-saffron/50 ${i === 3 ? "border-[#e8c766] bg-[#fdf6e4]" : "border-[#efe4cf] bg-white"}`}>
                <p className="text-[15.5px] font-semibold text-ink">{t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{d}</p>
              </div>
            </li>))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ numbers */
export function NumbersSection({ items }: { items: { n: number; label: string; sub: string }[] }) {
  return (
    <section className="reveal mx-auto max-w-6xl px-5 py-16">
      <Kicker center>All in one place</Kicker>
      <h2 className="mx-auto mb-10 max-w-3xl text-center text-[20px] font-semibold leading-snug tracking-[-0.015em] text-ink sm:text-[30px]">The teachings of Śrīla Gurudeva — heard, read and searched in one place</h2>
      <LiveNumbers items={items} />
    </section>
  );
}

/* ------------------------------------------------------------------ listen */
export type HomeLecture = { slug: string; title: string; date: string | null; place: string | null; duration_sec: number | null; transcript_status: string | null };
export function ListenSection({ lectures, counts }: { lectures: HomeLecture[]; counts: { lectures: number; kirtans: number; videos: number; transcripts: number } }) {
  return (
    <section className={`reveal ${BAND}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Kicker>Hari-kathā in his own voice</Kicker>
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">Listen, watch, and read along</h2>
          <p className="mb-8 text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">Lectures, darśanas and kīrtanas from 1985 to 1996, sorted by year, place, scripture and type — many with a full transcription you can follow as he speaks.</p>
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
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
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
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">Read his books, the way you like to read</h2>
          <p className="mb-8 text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">{total ? `${total} ${total === 1 ? "book" : "books"}` : "Books"} to read right here, chapter by chapter — and the same book in other languages as translations are added.</p>
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
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[1fr_1fr]">
        <div>
          <Kicker>Tattva</Kicker>
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">Follow one subject through everything he said</h2>
          <p className="mb-8 text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">Open a topic — Guru-tattva, the Holy Name, separation — and find his quotes, lectures, videos and articles on it together, each with its exact source.</p>
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
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-[460px] pb-10 pl-6 pr-10">
          <div aria-hidden className="absolute -left-2 top-8 size-40 rounded-full bg-[#fbf0d2] blur-2xl" />
          <div className="relative rounded-[1.4rem] p-[6px] shadow-[0_30px_60px_-25px_rgba(90,30,0,0.55)]" style={{ background: "linear-gradient(135deg, #e8c766 0%, #c2621d 45%, #8a1c0f 100%)" }}>
            <div className="overflow-hidden rounded-[1.1rem] border border-black/20">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/gurudeva-garland.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="block aspect-[4/5] w-full object-cover object-top" loading="lazy" /></div>
          </div>
          <div className="absolute -right-1 top-10 w-[34%] rotate-[4deg] rounded-xl bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/gurudeva-writing.webp" alt="" className="aspect-square w-full rounded-lg object-cover" loading="lazy" /></div>
          <div className="absolute bottom-0 left-0 w-[38%] -rotate-[4deg] rounded-xl bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/photos/gurudeva-smile.webp" alt="" className="aspect-[4/3] w-full rounded-lg object-cover object-top" loading="lazy" /></div>
          <span className="absolute bottom-3 right-4 rounded-full border border-[#eadcc0] bg-white/95 px-3 py-1 text-[11.5px] font-medium text-saffron shadow-sm">Śrī Śrīmad Gour Govinda Swāmī</span>
        </div>
        <div>
          <Kicker>Śrīla Gurudeva</Kicker>
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">A dear disciple of Śrīla Prabhupāda</h2>
          <p className="mb-8 text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">Born in a family devoted to Śrī Gopāl Jiu, he carried his Guru’s mission across Odisha and the world. Here his life is remembered — by those who knew him, in his own diary, and in photographs.</p>
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
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <Kicker center>On this website</Kicker>
        <h2 className="mb-10 text-center text-[20px] font-semibold tracking-[-0.015em] text-ink sm:text-[32px]">Everything, in one place</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{all.map(([h, I, t, d]) => (
          <Link key={h} href={h} className="group flex gap-4 rounded-2xl border border-[#eadcc0] bg-white p-5 transition hover:border-saffron hover:shadow-[0_14px_30px_-20px_rgba(120,60,10,0.4)]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#eadcc0] bg-[#fbf7ef] text-saffron"><I size={18} /></span>
            <span><span className="block text-[15px] font-medium text-ink group-hover:text-saffron">{t}</span><span className="mt-1 block text-[13px] leading-snug text-ink-2">{d}</span></span>
          </Link>))}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ webfolio */
export function WebFolioSection() {
  const side: [string, string][] = [["#d97706", "Śrīla Gurudeva"], ["#0d9488", "Audio lectures"], ["#7c3aed", "Transcriptions"], ["#db2777", "Kīrtanas"], ["#2563eb", "Books"], ["#65a30d", "Compilations"], ["#ea580c", "Articles"], ["#0891b2", "Magazines"]];
  return (
    <section className="reveal relative isolate overflow-hidden bg-[#2a1206] text-white">
      <Backdrop src="maroon-mandala" o={0.25} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-20 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="mb-3 text-[11.5px] font-medium uppercase tracking-[0.3em] text-[#f3d9a4]">WebFolio</p>
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[36px]">The whole archive, as one book you can carry</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-white/75">Every lecture, transcription, book, compilation and page — arranged like documentation, searchable in an instant, and yours to keep offline.</p>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{([[Search, "Search everything", "Ctrl K — any word, without diacritics"], [WifiOff, "Works offline", "Save it once, read anywhere"], [MonitorDown, "Install as an app", "On Windows, Mac, Android or iPhone"], [Download, "Download audio", "Lectures to keep with the pages"]] as [LucideIcon, string, string][]).map(([I, t, d]) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#f3d9a4] ring-1 ring-white/15"><I size={15} /></span><span><span className="block text-[14.5px] font-medium text-white">{t}</span><span className="block text-[13px] leading-snug text-white/65">{d}</span></span></li>)}</ul>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/webfolio" className="inline-flex items-center gap-2 rounded-full bg-[#e8c766] px-6 py-3 text-[14px] font-medium text-[#2a1206] transition hover:brightness-105">Open WebFolio <ArrowRight size={16} /></Link><Link href="/webfolio/download" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[14px] text-white transition hover:border-[#e8c766]">Download for offline</Link></div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2 border-b border-line bg-[#fafafa] px-4 py-2.5"><span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" /><span className="ml-3 flex-1 rounded-md border border-line bg-white px-3 py-1 text-[11.5px] text-ink-3">taptajivanam.com/webfolio</span></div>
          <div className="grid grid-cols-[170px_1fr] text-[12px]">
            <div className="border-r border-line p-3"><div className="mb-3 flex items-center gap-2 rounded-md border border-line px-2 py-1.5 text-ink-3"><Search size={12} />Search<kbd className="ml-auto rounded border border-line px-1 text-[10px]">⌘K</kbd></div>{side.map(([c, l], i) => <div key={l} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${i === 1 ? "bg-band font-medium text-ink" : "text-ink-2"}`}><span className="size-2 rounded-sm" style={{ background: c }} />{l}{i === 1 && <ChevronRight size={12} className="ml-auto text-ink-3" />}</div>)}</div>
            <div className="p-5"><p className="text-[11px] text-ink-3">Audio lectures / 1993 / Bhubaneswar</p><p className="mt-1 text-[17px] font-semibold tracking-[-0.01em]">Śrīmad-Bhāgavatam 1.2.6</p><div className="mt-3 flex items-center gap-2 rounded-lg border border-line p-2"><span className="flex size-7 items-center justify-center rounded-full bg-ink text-white"><Headphones size={13} /></span><span className="h-1 flex-1 rounded-full bg-band"><span className="block h-full w-1/3 rounded-full bg-ink/70" /></span><span className="text-[10.5px] text-ink-3">1:02:00</span></div><div className="mt-4 space-y-2">{[100, 94, 97, 70, 88, 92, 60].map((w, i) => <span key={i} className="block h-2 rounded bg-band" style={{ width: `${w}%` }} />)}</div></div>
          </div>
        </div>
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
