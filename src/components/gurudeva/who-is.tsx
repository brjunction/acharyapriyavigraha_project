import Link from "next/link";
import { ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { sql, hasDb } from "@/lib/db";

const serif = { fontFamily: "var(--font-reading-serif)" } as const;
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
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
        <nav className="flex items-center gap-1 text-[12px] text-ink-3"><Link href="/gurudeva" className="hover:text-saffron">Śrīla Gurudeva</Link><ChevronRight size={12} /><span className="text-ink-2">Who is Śrīla Gurudeva?</span></nav>
        <div className="mt-6 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h1 className="text-[30px] leading-tight text-ink sm:text-[38px]" style={serif}>Who is Śrīla Gurudeva?</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-2" style={serif}>Śrī Śrīmad Gour Govinda Swāmī Gurudeva was a dear disciple of Śrīla Prabhupāda, a sannyāsī of ISKCON from Odisha, and a teacher of the Śrīmad-Bhāgavatam whose words, spoken in simple English with the depth of the Gauḍīya ācāryas, still guide devotees around the world.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/gurudeva-portrait.webp" alt="Śrī Śrīmad Gour Govinda Swāmī Gurudeva" className="aspect-[4/5] w-full rounded-2xl object-cover object-top" />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="hidden lg:block"><div className="sticky top-24 space-y-1 text-[13px]"><p className="mb-2 font-medium text-ink">His life</p>{LIFE.map(([h]) => <a key={h} href={`#${h.replace(/\W+/g, "-").toLowerCase()}`} className="block text-ink-3 hover:text-ink">{h}</a>)}<a href="#books" className="block pt-2 text-ink-3 hover:text-ink">Books about him</a></div></nav>
          <div className="max-w-[680px] space-y-10">
            {LIFE.map(([h, t]) => <section key={h} id={h.replace(/\W+/g, "-").toLowerCase()} className="scroll-mt-24"><h2 className="text-[20px] font-semibold tracking-tight text-ink">{h}</h2><p className="mt-3 text-[16px] leading-[1.85] text-ink-2" style={serif}>{t}</p></section>)}
            <p className="text-[12.5px] text-ink-3">Sources: <a href="https://gopaljiu.org/?p=3579" target="_blank" rel="noreferrer" className="underline">Life Sketch, Gopal Jiu Publications</a>. Read his full life in the books below, and year by year in the <Link href="/gurudeva/timeline" className="underline">Life timeline</Link>.</p>
          </div>
        </div>

        <section id="books" className="mt-16 scroll-mt-24 border-t border-line pt-10">
          <h2 className="text-[22px] text-ink" style={serif}>Books about him</h2>
          <p className="mt-1 text-[14px] text-ink-2">Open any book to read it here.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...about.map((a) => ({ title: a.book?.title || a.title, note: a.note, slug: a.book?.slug, cover: a.book?.cover_url })), ...more.map((b) => ({ title: b.title, note: b.description || "", slug: b.slug, cover: b.cover_url }))].map((b) => {
              const inner = <><div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-band shadow-[0_1px_3px_rgba(0,0,0,0.12)]">{b.cover ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover} alt="" className="h-full w-full object-cover" /> : <BookOpen size={22} className="text-ink-3" />}</div>
                <div className="min-w-0"><h3 className="text-[15px] font-medium leading-snug text-ink">{b.title}</h3><p className="mt-1 line-clamp-3 text-[13px] leading-snug text-ink-2">{b.note}</p><p className={`mt-3 flex items-center gap-1 text-[12.5px] font-medium ${b.slug ? "text-saffron" : "text-ink-3"}`}>{b.slug ? <>Read now<ArrowRight size={13} /></> : "Coming to the library"}</p></div></>;
              return b.slug ? <Link key={b.title} href={`/books/${b.slug}`} className="flex gap-4 rounded-xl border border-line p-4 transition hover:border-line-strong hover:shadow-sm">{inner}</Link> : <div key={b.title} className="flex gap-4 rounded-xl border border-dashed border-line p-4">{inner}</div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
