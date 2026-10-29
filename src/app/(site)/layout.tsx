import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchPalette } from "@/components/search";
import { MiniPlayer } from "@/components/lecture";
import { Announcement } from "@/components/announcement";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <SearchPalette />
      <MiniPlayer />
      <Announcement />
    </>
  );
}
