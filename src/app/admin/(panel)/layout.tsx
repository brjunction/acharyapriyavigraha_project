"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Headphones, Clapperboard, PlayCircle, Notebook, BookOpen, Quote, Mail, Heart, Image as ImageIcon, Clock, FileText, Newspaper,
  Library, ScrollText, MapPin, Tags, Languages, ListTodo, BookA, Type, LayoutTemplate, Menu, PanelBottom, ScrollText as Thanks, ArrowRightLeft,
  Search as SearchIcon, FolderOpen, Link2, Users, ShieldCheck, History, Settings, Upload, DatabaseBackup, Plug, Bell, ExternalLink, ChevronsLeft,
} from "lucide-react";

const GROUPS: { title: string; items: [string, string, typeof Headphones][] }[] = [
  { title: "", items: [["/admin", "Overview", LayoutDashboard]] },
  { title: "Content", items: [["/admin/lectures", "Lectures & audio", Headphones], ["/admin/videos", "Videos", Clapperboard], ["/admin/daily-diary", "Daily Diary", PlayCircle], ["/admin/diaries", "Diaries", Notebook], ["/admin/books", "Books & magazines", BookOpen], ["/admin/quotes", "Quotes & compilations", Quote], ["/admin/letters", "Letters", Mail], ["/admin/memories", "Memories & glorifications", Heart], ["/admin/gallery", "Gallery", ImageIcon], ["/admin/timeline", "Life & timeline", Clock], ["/admin/pages", "Pages", FileText], ["/admin/news", "News & updates", Newspaper]] },
  { title: "Organize", items: [["/admin/tattva", "Tattva-kośa", Library], ["/admin/verses", "Scriptures & verses", ScrollText], ["/admin/people-places", "People · Places · Years", MapPin], ["/admin/tags", "Tags", Tags]] },
  { title: "Translations", items: [["/admin/languages", "Languages", Languages], ["/admin/translation-queue", "Translation queue", ListTodo], ["/admin/glossaries", "Glossaries", BookA], ["/admin/interface-strings", "Interface strings", Type]] },
  { title: "Site", items: [["/admin/site", "Home page builder", LayoutTemplate], ["/admin/menus", "Menus & hubs", Menu], ["/admin/footer", "Footer & contact", PanelBottom], ["/admin/thank-list", "Thank List", Thanks], ["/admin/redirects", "Redirects", ArrowRightLeft], ["/admin/seo", "SEO", SearchIcon]] },
  { title: "Media", items: [["/admin/media", "Media library", FolderOpen], ["/admin/link-checker", "Link checker", Link2]] },
  { title: "People", items: [["/admin/users", "Users", Users], ["/admin/roles", "Roles & permissions", ShieldCheck], ["/admin/audit-log", "Audit log", History]] },
  { title: "System", items: [["/admin/settings", "Settings", Settings], ["/admin/import-export", "Import / export", Upload], ["/admin/backups", "Backups", DatabaseBackup], ["/admin/integrations", "Integrations", Plug]] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-paper-2/60">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-card transition-all md:flex ${collapsed ? "w-[68px]" : "w-64"}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maroon font-serif text-paper">त</span>
          {!collapsed && <div className="leading-tight"><p className="font-serif text-[17px]">Taptajīvanam</p><p className="text-[11px] text-ink-3">Admin</p></div>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto rounded-md p-1 text-ink-3 hover:bg-paper-2" aria-label="Collapse"><ChevronsLeft size={16} className={collapsed ? "rotate-180" : ""} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-none">
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-3">
              {g.title && !collapsed && <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">{g.title}</p>}
              {g.items.map(([href, label, Icon]) => {
                const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
                return (
                  <Link key={href} href={href} title={label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition ${active ? "bg-maroon/10 font-medium text-maroon" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}>
                    <Icon size={16} strokeWidth={1.8} className="shrink-0" />{!collapsed && label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-card/90 px-4 backdrop-blur sm:px-6">
          <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink-3">
            <SearchIcon size={15} /><span className="flex-1">Search lectures, quotes, users…</span><kbd className="rounded border border-line px-1 text-[10px]">⌘K</kbd>
          </div>
          <Link href="/" target="_blank" className="ml-auto hidden items-center gap-1.5 text-sm text-ink-2 hover:text-ink sm:flex"><ExternalLink size={15} />View site</Link>
          <button className="relative rounded-full p-2 text-ink-2 hover:bg-paper-2" aria-label="Notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-saffron" /></button>
          <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-tulasi text-sm font-medium text-white">S</span><div className="hidden text-xs leading-tight sm:block"><p className="font-medium">Super Admin</p><p className="text-ink-3">admin</p></div></div>
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
