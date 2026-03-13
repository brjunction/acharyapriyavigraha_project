"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, Headphones, Newspaper, Info } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/media/audios", icon: Headphones, label: "Audio Transcripts" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/About", icon: Info, label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#152515] border-b border-[#c3a354]/20 shadow-[0_1px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#c3a354] to-[#e8d08a] flex items-center justify-center ring-2 ring-[#c3a354]/20 group-hover:ring-4 transition-all duration-300">
            <span className="font-serif text-[13px] font-bold text-[#152515] leading-none">
              SM
            </span>
          </div>
          <span className="hidden md:block font-serif text-[13px] text-[#e8d08a]/90 tracking-widest">
            Sravana Mangalam
          </span>
        </Link>

        {/* Icon Nav */}
        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 border
                  ${
                    active
                      ? "text-[#e8d08a] bg-[#c3a354]/10 border-[#c3a354]/20"
                      : "text-[#e4d6b4]/45 border-transparent hover:text-[#e8d08a]/80 hover:bg-[#c3a354]/8"
                  }`}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
                {active && (
                  <span className="absolute bottom-[5px] w-1 h-1 rounded-full bg-[#c3a354]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
