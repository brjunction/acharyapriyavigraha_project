import Link from "next/link";
import { BookOpen, ArrowRight, History, Quote } from "lucide-react";
import { sql, hasDb } from "@/lib/db";

/** Books about him, in the order to read them. Each opens when it is in the library; the others show as coming. */
const ABOUT = [
  { match: "krsnalingita|kṛṣṇāliṅgita|krishnalingita", title: "Kṛṣṇāliṅgita Vigraha", note: "The official biography, volume by volume." },
  { match: "gopal jiu|gopāl jiu|gopaljiu", title: "Gopāl Jiu", note: "His beloved Deity, and the family that served Him for generations." },
  { match: "when good fortune arises", title: "When Good Fortune Arises", note: "Memories of his life and pastimes." },
];
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

const LIFE: [string, string][] = [
  ["Early life", "He was born on 2 September 1929 in Jagannāthapura, a village near Jagannātha Purī in Odisha, and named Braja Bandhu Manik. He grew up mostly with his mother’s family, the Giris of Gaḍeigiri, Gauḍīya Vaiṣṇavas known for their kīrtana. As a quiet and serious boy he spent his free time serving the family Deity, Śrī Gopāl Jiu, and he was deeply attached to the Śrīmad-Bhāgavatam."],
  ["Householder and teacher", "He studied at Utkal University, earning B.A. and B.Ed. degrees, and became a government school teacher. He married in 1952, and after his father passed away in 1955 he supported the family."],
  ["Meeting Śrīla Prabhupāda", "In April 1974 he left home with a Bhagavad-gītā, two gāmuchās and a notebook. In September 1974, at ISKCON’s centre in Vṛndāvana, he met His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda, who soon initiated him as Gour Govinda Dāsa. On 20 April 1975, at the opening of the Śrī Śrī Kṛṣṇa-Balarāma temple in Vṛndāvana, he accepted sannyāsa."],
  ["Bhubaneswar", "On Śrīla Prabhupāda’s order he began ISKCON’s centre in Bhubaneswar on an overgrown plot of land, living in a mud hut. Śrīla Prabhupāda came in January 1977 and laid the foundation stone. After about sixteen years of work, the temple of Śrī Śrī Kṛṣṇa-Balarāma was opened in 1991."],
  ["Preaching around the world", "He began accepting disciples in 1985, joined ISKCON’s Governing Body Commission in 1987, and for about eleven years preached across India, Europe, Australia, Southeast Asia and America. He translated Śrīla Prabhupāda’s books into Odia, and his lectures, full of the Śrīmad-Bhāgavatam and the mood of Śrī Caitanya Mahāprabhu, were later compiled into many books."],
  ["Departure", "In early 1996 he visited Gaḍeigiri and Bhubaneswar, and then went to Śrīdhāma Māyāpur, where he left this world on 9 February 1996. His samādhi is in Bhubaneswar, in the mud hut that was his place of bhajana for many years."],
];

export async function WhoIsGurudeva() {
  let books: { slug: string; title: string; cover_url: string | null; description: string | null; category: string | null }[] = [];
  if (hasDb()) { try { books = (await sql`select slug, title, cover_url, description, category from books where status = 'published' order by position, title`) as any[]; } catch {} }
  const about = ABOUT.map((a) => ({ ...a, book: books.find((b) => new RegExp(a.match).test(fold(b.title))) }));
  const more = books.filter((b) => /about|biograph|life/i.test(b.category || "") && !about.some((a) => a.book?.slug === b.slug));
  const books_ = [...about.map((a) => ({ title: a.book?.title || a.title, note: a.note, slug: a.book?.slug, cover: a.book?.cover_url })), ...more.map((b) => ({ title: b.title, note: b.description || "", slug: b.slug, cover: b.cover_url }))];
  const id = (h: string) => h.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-[#fbf6ec] to-white">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(232,199,102,.35),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-[1120px] items-end gap-8 px-4 pt-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_340px] md:pt-14">
          <div className="pb-10 md:pb-16">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-saffron">Śrīla Gurudeva</p>
            <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[40px]">Who is Śrīla Gurudeva?</h1>
            <p className="mt-4 max-w-[560px] text-[15.5px] leading-relaxed text-ink-2 sm:text-[16.5px]">Śrī Śrīmad Gour Govinda Swāmī Gurudeva was a dear disciple of Śrīla Prabhupāda, a sannyāsī of ISKCON from Odisha, and a teacher of the Śrīmad-Bhāgavatam whose words, spoken in simple English with the depth of the Gauḍīya ācāryas, still guide devotees around the world.</p>
            <div className="mt-6 flex flex-wrap gap-2">{["Disciple of Śrīla Prabhupāda", "Sannyāsa in Vṛndāvana, 1975", "Founder of ISKCON Bhubaneswar", "Preached around the world"].map((x) => <span key={x} className="rounded-full border border-[#eadcc0] bg-white/80 px-3 py-1 text-[12.5px] font-medium text-ink-2">{x}</span>)}</div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a href={`#${id(LIFE[0][0])}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#8a1c0f] to-[#b8401a] px-5 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(138,28,15,.55)] transition hover:-translate-y-0.5">Read his life<ArrowRight size={15} /></a>
              <Link href="/gurudeva/timeline" className="inline-flex h-10 items-center gap-2 rounded-full border border-[#ecd9a8] bg-[#fdf6e3] px-5 text-[13.5px] font-semibold text-[#7a3b0c] transition hover:-translate-y-0.5 hover:border-[#e0bf6a]"><History size={15} />Life timeline</Link>
              <a href="#books" className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-white px-5 text-[13.5px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink"><BookOpen size={15} />Books about him</a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/legacy/gurudeva.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="bless-rise mx-auto block w-full max-w-[260px] object-contain object-bottom md:max-w-[340px]" />
        </div>
      </section>

      {/* His life */}
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="hidden lg:block"><div className="sticky top-24">
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">His life</p>
            <ol className="space-y-0.5 text-[13.5px]">{LIFE.map(([h], i) => <li key={h}><a href={`#${id(h)}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-ink-2 transition hover:bg-band hover:text-ink"><span className="flex size-5 items-center justify-center rounded-full bg-band text-[10.5px] font-semibold text-ink-3">{i + 1}</span>{h}</a></li>)}
              <li><a href="#books" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-ink-2 transition hover:bg-band hover:text-ink"><span className="flex size-5 items-center justify-center rounded-full bg-band text-ink-3"><BookOpen size={11} /></span>Books about him</a></li></ol>
          </div></nav>
          <div className="max-w-[720px]">
            <ol className="relative space-y-10 border-l border-line pl-8">
              {LIFE.map(([h, t], i) => <li key={h} id={id(h)} className="relative scroll-mt-24">
                <span className="absolute -left-[45px] top-0 flex size-[26px] items-center justify-center rounded-full border border-[#eadcc0] bg-white text-[12px] font-semibold text-saffron">{i + 1}</span>
                <h2 className="text-[19px] font-semibold tracking-tight text-ink sm:text-[21px]">{h}</h2>
                <p className="mt-2.5 text-[15.5px] leading-[1.8] text-ink-2">{t}</p>
                {i === 2 && <figure className="mt-6 rounded-2xl border border-[#eadcc0] bg-[#fdf9f0] p-5"><Quote size={18} className="text-saffron" /><blockquote className="mt-2 text-[16px] font-medium leading-relaxed text-ink">“Kṛṣṇa sent him.”</blockquote><figcaption className="mt-1.5 text-[12.5px] text-ink-3">Śrīla Prabhupāda, room conversation · Bombay, 5 January 1977</figcaption></figure>}
              </li>)}
            </ol>
            <p className="mt-10 rounded-xl bg-band px-4 py-3 text-[12.5px] text-ink-3">Source: <a href="https://gopaljiu.org/?p=3579" target="_blank" rel="noreferrer" className="font-medium text-ink-2 underline underline-offset-2">Life Sketch, Gopal Jiu Publications</a>. Read his full life in the books below, and year by year in the <Link href="/gurudeva/timeline" className="font-medium text-ink-2 underline underline-offset-2">Life timeline</Link>.</p>
          </div>
        </div>
      </div>

      {/* Books */}
      <section id="books" className="scroll-mt-24 border-t border-line bg-[#f8f9fa]">
        <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">Books about him</h2>
          <p className="mt-1 text-[14px] text-ink-2">Open any book to read it here.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books_.map((b) => {
              const inner = <><div className="flex aspect-[3/4] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-band shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)]">{b.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover} alt="" className="h-full w-full object-cover" /> : <BookOpen size={22} className="text-ink-3" />}</div>
                <div className="min-w-0"><h3 className="text-[15px] font-semibold leading-snug text-ink">{b.title}</h3><p className="mt-1 line-clamp-3 text-[13px] leading-snug text-ink-2">{b.note}</p><p className={`mt-3 flex items-center gap-1 text-[12.5px] font-semibold ${b.slug ? "text-[#1a73e8]" : "text-ink-3"}`}>{b.slug ? <>Read now<ArrowRight size={13} /></> : "Coming to the library"}</p></div></>;
              return b.slug ? <Link key={b.title} href={`/books/${b.slug}`} className="flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-16px_rgba(0,0,0,.3)]">{inner}</Link> : <div key={b.title} className="flex gap-4 rounded-2xl border border-dashed border-line-strong bg-white p-4">{inner}</div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
