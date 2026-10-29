import { Header } from "@/components/header";
import { MenusProvider } from "@/components/menus-context";
import { getSavedMenus } from "@/lib/menus-server";
import { Footer } from "@/components/footer";
import { SearchPalette } from "@/components/search";
import { MiniPlayer } from "@/components/lecture";
import { Announcement } from "@/components/announcement";
import { EditBar } from "@/components/edit-bar";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const saved = await getSavedMenus();
  return (
    <MenusProvider saved={saved}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <SearchPalette />
      <MiniPlayer />
      <Announcement />
      <EditBar />
    </MenusProvider>
  );
}
