import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Hero } from "@/components/home-client";
import { Container } from "@/components/ui";
import { VectorToran } from "@/components/motifs";
import { Divider, BlessingSection, FounderNew, NumbersSection, ListenSection, ReadSection, TattvaSection, GurudevaSection, EverythingSection, WebFolioSection, type HomeLecture, type HomeBook } from "@/components/home/sections";
import { sql, hasDb } from "@/lib/db";
import { STATS } from "@/lib/data";
import { topics as getTopics } from "@/lib/content/topics";

export const revalidate = 300;

const one = async (q: Promise<any[]>) => { try { return Number((await q)[0]?.n || 0); } catch { return 0; } };
const rows = async <T,>(q: Promise<any[]>) => { try { return (await q) as T[]; } catch { return [] as T[]; } };

export default async function Home() {
  const db = hasDb();
  const [lectures, kirtans, videos, transcripts, books, quotes, latest, shelf, tps] = await Promise.all([
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan')`) : STATS.lectures,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind in ('kirtan','bhajan')`) : 0,
    db ? one(sql`select count(*)::int n from videos where status = 'published'`) : STATS.videos,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and transcript_status = 'done'`) : STATS.transcriptions,
    db ? one(sql`select count(*)::int n from books where status = 'published'`) : STATS.books,
    db ? one(sql`select count(*)::int n from excerpts where status = 'published'`) : 0,
    db ? rows<HomeLecture>(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date, place, duration_sec, transcript_status from audios where status = 'published' and kind not in ('kirtan','bhajan') order by created_at desc limit 6`) : [],
    db ? rows<HomeBook>(sql`select slug, title, cover_url, language from books where status = 'published' order by position, title limit 8`) : [],
    getTopics().catch(() => []),
  ]);
  const topTopics = [...tps].sort((a, b) => b.total - a.total).slice(0, 24).map((t) => ({ name: t.name, slug: t.slug, total: t.total }));
  return (
    <>
      <Hero />
      <Divider />
      <BlessingSection />
      <FounderNew />
      <NumbersSection items={[
        { n: lectures, label: "Lectures", sub: "audio, 1985–1996" },
        { n: kirtans, label: "Kīrtanas", sub: "songs he sang" },
        { n: videos, label: "Videos", sub: "from the channels" },
        { n: transcripts, label: "Transcriptions", sub: "to read along" },
        { n: books, label: "Books", sub: "to read online" },
        { n: quotes || tps.length, label: quotes ? "Compilations" : "Topics", sub: quotes ? "quotes, verses, stories" : "in Tattva" },
      ]} />
      <ListenSection lectures={latest} counts={{ lectures, kirtans, videos, transcripts }} />
      <ReadSection books={shelf} total={books} />
      <TattvaSection topics={topTopics} quotes={quotes} />
      <GurudevaSection />
      <EverythingSection />
      <WebFolioSection />

      {/* Thank list */}
      <section className="reveal mt-16 sm:mt-20">
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl border border-[#eadcc0] bg-[#fdf9f1] px-6 pb-12 pt-16 text-center sm:px-12">
            <VectorToran flip className="absolute inset-x-0 top-0 text-[#c9a227]/45" />
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadcc0] bg-white text-saffron"><HeartHandshake size={24} strokeWidth={1.8} /></span>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.3em] text-saffron">With gratitude</p>
            <h2 className="mt-1 text-[22px] font-semibold text-ink sm:text-[26px]">Our Thank List</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
            <Link href="/thank-list" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-saffron px-5 text-[13.5px] font-medium text-white hover:opacity-90">Read the Thank List<ArrowRight size={15} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
