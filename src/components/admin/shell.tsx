"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, Database, Image as Img, Megaphone, Users, Settings, LogOut, Menu, ExternalLink, X } from "lucide-react";
import { api } from "./ui";

const NAV = [
  ["/admin", "Overview", LayoutDashboard], ["/admin/pages", "Pages & books", FileText], ["/admin/databases", "Databases", Database],
  ["/admin/media", "Pictures", Img], ["/admin/announcements", "Announcements", Megaphone], ["/admin/users", "People & roles", Users], ["/admin/settings", "Site settings", Settings],
] as const;

export function Shell({ user, children }: { user: { name: string; email: string; role: string }; children: React.ReactNode }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  if (/^\/admin\/pages\/[^/]+$/.test(path)) return <>{children}</>; // the editor uses the full screen
  const bar = (
    <nav className="flex h-full flex-col p-4">
      <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="h-9 w-9" /><span className="text-[16px] font-bold tracking-[-0.02em]">Studio</span></Link>
      <div className="space-y-1">{NAV.map(([h, l, I]) => { const on = h === "/admin" ? path === h : path.startsWith(h); return (
        <Link key={h} href={h} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition ${on ? "bg-saffron-soft text-saffron" : "text-ink-2 hover:bg-band"}`}><I size={18} />{l}</Link>); })}</div>
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-ink-2 hover:bg-band"><ExternalLink size={17} />View the website</Link>
        <button onClick={async () => { await api("/api/admin/auth", "POST", { action: "logout" }); window.location.href = "/admin/login"; }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-ink-2 hover:bg-band"><LogOut size={17} />Sign out</button>
        <p className="px-3 pt-2 text-[12px] text-ink-3">{user.name}<br />{user.email} · {user.role}</p>
      </div>
    </nav>
  );
  return (
    <div className="min-h-screen bg-page lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">{bar}</aside>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden"><button onClick={() => setOpen(true)} aria-label="Menu"><Menu size={22} /></button><b>Studio</b></div>
      {open && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 bg-surface" onClick={(e) => e.stopPropagation()}><button className="absolute right-3 top-3" onClick={() => setOpen(false)}><X size={20} /></button>{bar}</aside></div>}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
