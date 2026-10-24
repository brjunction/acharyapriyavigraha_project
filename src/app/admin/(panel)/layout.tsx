"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Headphones, Clapperboard, PlayCircle, Notebook, BookOpen, Quote, Mail, Heart, Image as ImageIcon, Clock, FileText, Newspaper,
  Network, ScrollText, MapPin, Tags, Languages, ListTodo, BookA, Type, LayoutTemplate, Menu, PanelBottom, HeartHandshake, ArrowRightLeft,
  Search, FolderOpen, Link2, Users, ShieldCheck, History, Settings, Upload, DatabaseBackup, Plug, Bell, ExternalLink, ChevronsLeft, IdCard,
} from "lucide-react";
import { LogoMark } from "@/components/motifs";

const GROUPS: { title: string; items: [string, string, typeof Headphones][] }[] = [
  { title: "", items: [["/admin", "Overview", LayoutDashboard]] },
  { title: "Content", items: [["/admin/lectures", "Lectures & audio", Headphones], ["/admin/videos", "Videos", Clapperboard], ["/admin/daily-diary", "Daily Diary", PlayCircle], ["/admin/diaries", "Diaries", Notebook], ["/admin/books", "Books & magazines", BookOpen], ["/admin/quotes", "Quotes & compilations", Quote], ["/admin/letters", "Letters", Mail], ["/admin/disciples", "Disciple database", IdCard], ["/admin/memories", "Memories & glorifications", Heart], ["/admin/gallery", "Gallery", ImageIcon], ["/admin/timeline", "Life & timeline", Clock], ["/admin/pages", "Pages", FileText], ["/admin/news", "News & updates", Newspaper]] },
  { title: "Organize", items: [["/admin/tattva", "Tattva", Network], ["/admin/verses", "Scriptures & verses", ScrollText], ["/admin/people-places", "People, places, years", MapPin], ["/admin/tags", "Tags", Tags]] },
  { title: "Translations", items: [["/admin/languages", "Languages", Languages], ["/admin/translation-queue", "Translation queue", ListTodo], ["/admin/glossaries", "Glossaries", BookA], ["/admin/interface-strings", "Interface text", Type]] },
  { title: "Site", items: [["/admin/site", "Home page", LayoutTemplate], ["/admin/menus", "Menus", Menu], ["/admin/footer", "Footer & contact", PanelBottom], ["/admin/thank-list", "Thank List", HeartHandshake], ["/admin/redirects", "Redirects", ArrowRightLeft], ["/admin/seo", "SEO", Search]] },
  { title: "Media", items: [["/admin/media", "Media library", FolderOpen], ["/admin/link-checker", "Link checker", Link2]] },
  { title: "People", items: [["/admin/users", "Users", Users], ["/admin/roles", "Roles & permissions", ShieldCheck], ["/admin/audit-log", "Activity log", History]] },
  { title: "System", items: [["/admin/settings", "Settings", Settings], ["/admin/import-export", "Import & export", Upload], ["/admin/backups", "Backups", DatabaseBackup], ["/admin/integrations", "Integrations", Plug]] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-page">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] md:flex ${collapsed ? "w-[72px]" : "w-64"}`}>
        <div className="bar-saffron flex h-16 items-center gap-2.5 px-4">
          <LogoMark className="h-9 w-9 shrink-0 text-white" />
          {!collapsed && <div className="leading-tight"><p className="font-serif text-[17px] font-bold">Taptajīvanam</p><p className="text-[11px] text-white/75">Dashboard</p></div>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto rounded-md p-1 text-white/80 hover:bg-white/10" aria-label="Collapse sidebar"><ChevronsLeft size={16} className={collapsed ? "rotate-180" : ""} /></button>
        </div>
        <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
          {GROUPS.map((g) => (
            <div key={g.title || "top"} className="mb-3">
              {g.title && !collapsed && <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{g.title}</p>}
              {g.items.map(([href, label, Icon]) => {
                const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
                return (
                  <Link key={href} href={href} title={label} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition ${active ? "bg-saffron-soft font-medium text-saffron" : "text-ink-2 hover:bg-band hover:text-ink"}`}>
                    <Icon size={16} strokeWidth={1.8} className="shrink-0" />{!collapsed && label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
          <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl border border-line bg-page px-3 py-2 text-[13.5px] text-ink-3"><Search size={15} /><span className="flex-1">Search lectures, quotes, people…</span><kbd className="rounded border border-line px-1 text-[10px]">Ctrl K</kbd></div>
          <Link href="/" target="_blank" className="ml-auto hidden items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-saffron sm:flex"><ExternalLink size={15} />View site</Link>
          <button className="relative rounded-full p-2 text-ink-2 hover:bg-band" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-saffron" /></button>
          <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron text-[13px] font-semibold text-white">S</span><div className="hidden text-[12px] leading-tight sm:block"><p className="font-medium">Super Admin</p><p className="text-ink-3">admin</p></div></div>
        </header>
        <main className="px-4 py-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
