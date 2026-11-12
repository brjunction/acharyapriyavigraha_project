"use client";
/* The Gauḍīya library's own slim bar under the site header: always the same five places, the current one marked. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const LINKS: [string, string][] = [["/gaudiya", "Home"], ["/gaudiya/books", "Books"], ["/gaudiya/acharyas", "Ācāryas"], ["/gaudiya/biographies", "Biographies"], ["/gaudiya/parampara", "Guru-paramparā"]];
export function GaudiyaNav() {
  const p = usePathname() || "";
  const on = (h: string) => (h === "/gaudiya" ? p === h : p.startsWith(h));
  return (
    <div className="sticky top-[52px] z-30 border-b border-line bg-white/90 backdrop-blur sm:top-[58px]">
      <div className="mx-auto flex h-12 max-w-[1240px] items-center gap-1 px-3 sm:px-6">
        <Link href="/gaudiya" className="mr-3 hidden shrink-0 items-center gap-2 text-[13px] font-semibold tracking-tight text-ink md:flex"><span className="flex size-6 items-center justify-center rounded-full bg-saffron/10 text-[12px] text-saffron">ॐ</span>Gauḍīya Library</Link>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">{LINKS.map(([h, l]) => <Link key={h} href={h} className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] transition ${on(h) ? "bg-ink text-white" : "text-ink-2 hover:bg-band"}`}>{l}</Link>)}</nav>
        <Link href="/gaudiya/books" aria-label="Search the library" className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-band"><Search size={17} /></Link>
      </div>
    </div>);
}
