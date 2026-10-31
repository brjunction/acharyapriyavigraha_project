import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Hero } from "@/components/home-client";
import { Container } from "@/components/ui";
import { VectorToran } from "@/components/motifs";
import { Backdrop } from "@/components/backdrop";
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
      <section className="reveal mt-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl bg-[#4a0a0c] px-6 py-14 text-center text-white sm:px-12">
            <Backdrop src="red-gold-mandala" o={0} className="-z-10 opacity-60" />
            <VectorToran flip className="absolute inset-x-0 top-0 text-[#e8b872]/30" />
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-[#e8b872]/50"><HeartHandshake size={26} strokeWidth={1.8} className="text-[#f1d3a4]" /></span>
            <h2 className="mt-3 text-[20px] !text-white sm:text-[24px]">Our Thank List</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-white/85">This archive is built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva, in many countries.</p>
            <Link href="/thank-list" className="btn mt-6 !h-10 bg-gradient-to-r from-saffron to-[#e8b872] !px-5 text-white shadow-[0_6px_18px_-8px_rgba(243,179,99,0.8)] hover:brightness-110">Read the Thank List<ArrowRight size={15} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
