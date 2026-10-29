import { cmsOverride } from "@/lib/cms/render";
import { BookOpen, Headphones, Clapperboard } from "lucide-react";
import { MenuHub } from "@/components/sections";
import { ArchiveTile, Container } from "@/components/ui";
import { STATS } from "@/lib/data";

export const metadata = { title: "His Teachings" };

export default async function Page() {
  const cms = await cmsOverride('/teachings'); if (cms) return cms;
  return <Original />;
}

function Original() {
  return (
    <MenuHub menuKey="teachings" before={
      <Container className="pt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ArchiveTile tone="saffron" href="/teachings/books" icon={BookOpen} title="Books" desc="Read online, browse by publisher, download where permitted." count={`${STATS.books} titles`} />
          <ArchiveTile tone="charcoal" href="/teachings/audio" icon={Headphones} title="Audio lectures" desc="Every recorded lecture, filterable by year, place, verse and topic." count={`${STATS.lectures.toLocaleString()} lectures`} />
          <ArchiveTile tone="saffron" href="/teachings/videos" icon={Clapperboard} title="Videos" desc="Lectures on video, excerpts and memories." count={`${STATS.videos} videos`} />
        </div>
      </Container>
    } />
  );
}
