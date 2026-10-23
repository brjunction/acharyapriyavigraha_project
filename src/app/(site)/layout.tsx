import { Header, Footer, SettingsDrawer, CommandPalette, MiniPlayer, MobileTabs } from "@/components/chrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-tulasi text-center text-[12px] text-white/90 py-1.5 px-4">Prototype preview · design only · all counts and lecture listings are sample data</div>
      <Header />
      <main className="min-h-[60vh] pb-20 sm:pb-0">{children}</main>
      <Footer />
      <SettingsDrawer />
      <CommandPalette />
      <MiniPlayer />
      <MobileTabs />
    </>
  );
}
