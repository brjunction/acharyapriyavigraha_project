/* The home page. Rendered by / and, with another design chosen, by /home-new?blessing=… */
import { Hero } from "@/components/home-client";
import { Blessing } from "@/components/home/blessing";
import { ThreeThings, OnPrabhupada } from "@/components/gurudeva-instructions";
import { NumbersSection, WebFolioSection, type HomeLecture, type HomeBook } from "@/components/home/sections";
import { KrishnaSentOpening, FounderJourney, VerseBand } from "@/components/home/opening";
import { ListenNew, BooksNew, TattvaNew, EverythingNew, ThanksNew } from "@/components/home/new-sections";
import { sql, hasDb } from "@/lib/db";
import { STATS } from "@/lib/data";
import { topics as getTopics } from "@/lib/content/topics";


const one = async (q: Promise<any[]>) => { try { return Number((await q)[0]?.n || 0); } catch { return 0; } };
const rows = async <T,>(q: Promise<any[]>) => { try { return (await q) as T[]; } catch { return [] as T[]; } };

export async function HomePage({ blessing }: { blessing?: string }) {
  const db = hasDb();
  const [lectures, kirtans, videos, transcripts, books, quotes, latest, shelf, tps] = await Promise.all([
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan')`) : STATS.lectures,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and kind in ('kirtan','bhajan')`) : 0,
    db ? one(sql`select count(*)::int n from videos where status = 'published'`) : STATS.videos,
    db ? one(sql`select count(*)::int n from audios where status = 'published' and transcript_status = 'done'`) : STATS.transcriptions,
    db ? one(sql`select count(*)::int n from books where status = 'published'`) : STATS.books,
    db ? one(sql`select count(*)::int n from excerpts where status = 'published'`) : 0,
    db ? rows<HomeLecture>(sql`select slug, title, to_char(date, 'YYYY-MM-DD') date, place, duration_sec, transcript_status from audios where status = 'published' and kind not in ('kirtan','bhajan') order by created_at desc limit 5`) : [],
    db ? rows<HomeBook>(sql`select slug, title, cover_url, language from books where status = 'published' order by position, title limit 8`) : [],
    getTopics().catch(() => []),
  ]);
  const topTopics = [...tps].sort((a, b) => b.total - a.total).slice(0, 24).map((t) => ({ name: t.name, slug: t.slug, total: t.total }));
  return (
    <>
      <Hero />
      <VerseBand />
      {/* “Kṛṣṇa sent him”: the new design here; /home-new?blessing=… still shows the four older ones */}
      {blessing ? <Blessing v={blessing} /> : <KrishnaSentOpening />}
      <FounderJourney />
      <ThreeThings />
      <NumbersSection items={[
        { n: lectures, label: "Lectures", sub: "audio, 1985–1996" },
        { n: kirtans, label: "Kīrtanas", sub: "songs he sang" },
        { n: videos, label: "Videos", sub: "from the channels" },
        { n: transcripts, label: "Transcriptions", sub: "to read along" },
        { n: books, label: "Books", sub: "to read online" },
        { n: quotes || tps.length, label: quotes ? "Compilations" : "Topics", sub: quotes ? "quotes, verses, stories" : "in Tattva" },
      ]} />
      <ListenNew latest={latest} lectures={lectures} kirtans={kirtans} videos={videos} transcripts={transcripts} />
      <OnPrabhupada />
      <BooksNew shelf={shelf} />
      <TattvaNew topTopics={topTopics} />
      <EverythingNew />
      <WebFolioSection />
      <ThanksNew />
    </>
  );
}
