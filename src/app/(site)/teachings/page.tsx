import { cmsOverride } from "@/lib/cms/render";
import { BookOpen, Headphones, Clapperboard } from "lucide-react";
import { MenuHub } from "@/components/sections";
import { ArchiveTile, Container } from "@/components/ui";
import { sql, hasDb } from "@/lib/db";

export const metadata = { title: "His Teachings" };
export const revalidate = 600;

export default async function Page() {
  const cms = await cmsOverride('/teachings'); if (cms) return cms;
  // real counts only (no figure is shown when it cannot be read)
  const n = async (q: Promise<any[]>) => { try { return Number((await q)[0]?.n) || 0; } catch { return 0; } };
  const [books, lectures, videos] = hasDb() ? await Promise.all([n(sql`select count(*)::int n from books where status = 'published' and library = 'main'`), n(sql`select count(*)::int n from audios where status = 'published' and kind not in ('kirtan','bhajan')`), n(sql`select count(*)::int n from videos where status = 'published'`)]) : [0, 0, 0];
  return <Original books={books} lectures={lectures} videos={videos} />;
}

function Original({ books, lectures, videos }: { books: number; lectures: number; videos: number }) {
  return (
    <MenuHub menuKey="teachings" before={
      <Container className="pt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ArchiveTile tone="saffron" href="/teachings/books" icon={BookOpen} title="Books" desc="Read online, browse by publisher, download where permitted." count={books ? `${books} ${books === 1 ? "book" : "books"}` : undefined} />
          <ArchiveTile tone="charcoal" href="/teachings/audio" icon={Headphones} title="Audio lectures" desc="Every recorded lecture, filterable by year, place, verse and topic." count={lectures ? `${lectures.toLocaleString()} lectures` : undefined} />
          <ArchiveTile tone="saffron" href="/teachings/videos" icon={Clapperboard} title="Videos" desc="Lectures on video, excerpts and memories." count={videos ? `${videos.toLocaleString()} videos` : undefined} />
        </div>
      </Container>
    } />
  );
}
