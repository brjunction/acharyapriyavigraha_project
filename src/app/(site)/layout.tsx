import { Header } from "@/components/header";
import { MenusProvider } from "@/components/menus-context";
import { getSavedMenus, getTheme } from "@/lib/menus-server";
import { themeCss, fontHref } from "@/lib/theme";
import { Footer } from "@/components/footer";
import { SearchPalette } from "@/components/search";
import { MiniPlayer } from "@/components/lecture";
import { Announcement } from "@/components/announcement";
import { EditBar } from "@/components/edit-bar";
import { FooterSwitch } from "@/components/footer-switch";
import { NavToggle } from "@/components/nav-toggle";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [saved, theme] = await Promise.all([getSavedMenus(), getTheme()]);
  const css = themeCss(theme); const fonts = fontHref(theme);
  return (
    <MenusProvider saved={saved}>
      {fonts && <link rel="stylesheet" href={fonts} />}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <FooterSwitch><Footer /></FooterSwitch>
      </div>
      <NavToggle />
      <SearchPalette />
      <MiniPlayer />
      <Announcement />
      <EditBar />
    </MenusProvider>
  );
}
