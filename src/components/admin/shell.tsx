"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, MoreHorizontal, Search, Home, Database, Image as Img, Megaphone, Users, Settings, LogOut, ExternalLink, Menu as MenuIcon, X, FileText, PanelsTopLeft, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { api, toast } from "./ui";
import type { MenuJ } from "@/lib/menus";
import { PageIcon } from "../page-icon";

type P = { id: string; parent_id: string | null; title: string; path: string; status: string; position: number; icon?: string; type: string };

export function Shell({ user, children }: { user: { name: string; email: string; role: string }; children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const [pages, setPages] = useState<P[]>([]); const [menus, setMenus] = useState<MenuJ[]>([]); const [dbs, setDbs] = useState<{ id: string; name: string; slug: string }[]>([]); const [lib, setLib] = useState<{ id: string; slug: string; name: string; icon: string; group: string; rows: number }[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({}); const [q, setQ] = useState(""); const [mobile, setMobile] = useState(false);
  const load = useCallback(() => { api<P[]>("/api/admin/pages").then(setPages).catch(() => {}); api<MenuJ[]>("/api/admin/menus").then(setMenus).catch(() => {}); api("/api/admin/library").then(setLib).catch(() => {}); api("/api/admin/dbs").then(setDbs).catch(() => {}); }, []);
  useEffect(() => { load(); const h = () => load(); window.addEventListener("tj:pages-changed", h); return () => window.removeEventListener("tj:pages-changed", h); }, [load]);
  useEffect(() => { try { setOpen(JSON.parse(localStorage.getItem("tj_tree") || "{}")); } catch {} }, []);
  const toggle = (id: string) => setOpen((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem("tj_tree", JSON.stringify(n)); } catch {} return n; });
  const cur = /^\/admin\/pages\/([^/]+)/.exec(path)?.[1];
  // keep the open page's ancestors expanded
  useEffect(() => { if (!cur || !pages.length) return; const byId = Object.fromEntries(pages.map((p) => [p.id, p])); let p = byId[cur]; const add: Record<string, boolean> = {}; while (p?.parent_id) { add[p.parent_id] = true; p = byId[p.parent_id]; } if (Object.keys(add).length) setOpen((o) => ({ ...o, ...add })); }, [cur, pages]);
  const kids = useMemo(() => { const m: Record<string, P[]> = {}; pages.forEach((p) => { (m[p.parent_id || "root"] ||= []).push(p); }); Object.values(m).forEach((l) => l.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title))); return m; }, [pages]);
  const byPath = useMemo(() => Object.fromEntries(pages.map((p) => [p.path, p])), [pages]);
  const menuPaths = useMemo(() => new Set(menus.flatMap((m) => m.groups.flatMap((g) => g.links.map((l) => l.href)))), [menus]);
  const openAt = async (path: string, title: string) => { try { const r = await api<{ id: string }>("/api/admin/pages", "POST", { path, title }); load(); router.push(`/admin/pages/${r.id}`); setMobile(false); } catch (e: any) { toast(e.message, true); } };
  const newPage = async (parent?: string) => { const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: parent || null, template: "blank" }); if (parent) setOpen((o) => ({ ...o, [parent]: true })); load(); router.push(`/admin/pages/${r.id}`); setMobile(false); };
  const move = async (p: P, d: number) => { const sib = kids[p.parent_id || "root"] || []; const i = sib.findIndex((x) => x.id === p.id); const o = sib[i + d]; if (!o) return; await Promise.all(sib.map((x, k) => api(`/api/admin/pages/${x.id}`, "PATCH", { position: x.id === p.id ? i + d : x.id === o.id ? i : k }))); load(); };
  const del = async (p: P) => { if (!confirm(`Delete “${p.title}” and every page inside it? This cannot be undone.`)) return; await api(`/api/admin/pages/${p.id}`, "DELETE").catch((e) => toast(e.message, true)); load(); if (cur === p.id) router.push("/admin"); };
  const dup = async (p: P) => { const src = await api(`/api/admin/pages/${p.id}`); const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: p.parent_id, title: `${p.title} (copy)` }); await api(`/api/admin/pages/${r.id}`, "PATCH", { blocks: src.blocks, settings: src.settings, type: src.type }); load(); router.push(`/admin/pages/${r.id}`); };

  const Row = ({ p, depth }: { p: P; depth: number }) => {
    const [menu, setMenu] = useState(false); const ch = kids[p.id] || []; const on = cur === p.id;
    return (
      <div>
        <div className={`group relative flex h-[30px] items-center rounded-md pr-1 text-[13.5px] ${on ? "bg-[#f3e6d6] font-semibold text-ink" : "text-ink-2 hover:bg-[#f4ece2]"}`} style={{ paddingLeft: 4 + depth * 14 }}>
          <button onClick={() => toggle(p.id)} aria-label="Expand" className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-3 hover:bg-[#eadccb]"><ChevronRight size={13} className={`transition ${open[p.id] ? "rotate-90" : ""} ${ch.length ? "" : "opacity-30"}`} /></button>
          <Link href={`/admin/pages/${p.id}`} onClick={() => setMobile(false)} className="flex min-w-0 flex-1 items-center gap-1.5 pl-0.5"><span className="flex w-5 shrink-0 justify-center text-[14px]">{p.icon ? <PageIcon icon={p.icon} size={16} /> : (p.type === "book" ? "📖" : p.type === "chapter" ? "📑" : <FileText size={14} className="mx-auto text-ink-3" />)}</span><span className="truncate">{p.title || "Untitled"}</span>{p.status !== "published" && <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9a441]" title="Draft" />}</Link>
          <span className="hidden items-center group-hover:flex">
            <button title="More" onClick={() => setMenu(!menu)} className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:bg-[#eadccb]"><MoreHorizontal size={14} /></button>
            <button title="Add a page inside" onClick={() => newPage(p.id)} className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:bg-[#eadccb]"><Plus size={14} /></button>
          </span>
          {menu && <div className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-line bg-white p-1 text-[13px] shadow-xl" onMouseLeave={() => setMenu(false)}>
            {[[ArrowUp, "Move up", () => move(p, -1)], [ArrowDown, "Move down", () => move(p, 1)], [Copy, "Duplicate", () => dup(p)], [ExternalLink, "View on site", () => window.open(p.path, "_blank")], [Trash2, "Delete", () => del(p)]].map(([I, l, f]: any) => <button key={l} onClick={() => { setMenu(false); f(); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-band ${l === "Delete" ? "text-[#a3281e]" : ""}`}><I size={14} />{l}</button>)}
          </div>}
        </div>
        {open[p.id] && (ch.length ? ch.map((c) => <Row key={c.id} p={c} depth={depth + 1} />) : <p className="py-1 text-[12.5px] text-ink-3" style={{ paddingLeft: 30 + depth * 14 }}>No pages inside</p>)}
      </div>
    );
  };
  const found = q ? pages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : null;
  const Nav = ({ href, icon: I, label }: { href: string; icon: any; label: string }) => <Link href={href} onClick={() => setMobile(false)} className={`flex h-[30px] items-center gap-2 rounded-md px-2 text-[13.5px] ${path === href || (href !== "/admin" && path.startsWith(href)) ? "bg-[#f3e6d6] font-semibold text-ink" : "text-ink-2 hover:bg-[#f4ece2]"}`}><I size={15} className="text-ink-3" />{label}</Link>;

  const side = (
    <div className="flex h-full flex-col bg-[#faf6f0]">
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="h-7 w-7" /><div className="min-w-0 leading-tight"><p className="truncate text-[13.5px] font-bold">Taptajīvanam</p><p className="truncate text-[11.5px] text-ink-3">{user.name || user.email}</p></div></div>
      <div className="px-2"><div className="relative"><Search size={13} className="absolute left-2.5 top-2 text-ink-3" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages" className="h-[30px] w-full rounded-md bg-[#f0e8dc] pl-7 pr-2 text-[13px] outline-none placeholder:text-ink-3 focus:bg-white focus:ring-1 focus:ring-saffron" /></div></div>
      <div className="mt-2 space-y-0.5 px-2"><Nav href="/admin" icon={Home} label="Home" /><Nav href="/admin/menus" icon={PanelsTopLeft} label="Website menus" /></div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!found && menus.length > 0 && <>
          <div className="flex items-center justify-between px-2 py-1 text-[11.5px] font-semibold text-ink-3"><span>Website</span><Link href="/admin/menus" title="Edit menus" className="rounded p-0.5 hover:bg-[#eadccb]"><PanelsTopLeft size={13} /></Link></div>
          {menus.map((m) => (
            <div key={m.key}>
              <button onClick={() => toggle("menu:" + m.key)} className="flex h-[30px] w-full items-center gap-1 rounded-md px-1 text-[13.5px] font-semibold text-ink hover:bg-[#f4ece2]"><ChevronRight size={13} className={`text-ink-3 transition ${open["menu:" + m.key] ? "rotate-90" : ""}`} />{m.label}</button>
              {open["menu:" + m.key] && m.groups.map((g) => (
                <div key={g.title} className="mb-1">
                  <p className="truncate pl-6 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{g.title}</p>
                  {g.links.filter((l) => l.href.startsWith("/") && !l.hidden).map((l) => { const pg = byPath[l.href]; return pg ? <Row key={l.href} p={{ ...pg, title: pg.title || l.label }} depth={1} /> : (
                    <button key={l.href} onClick={() => openAt(l.href, l.label)} title="Make an editable page here" className="group flex h-[30px] w-full items-center gap-1.5 rounded-md pl-[22px] pr-1 text-left text-[13.5px] text-ink-3 hover:bg-[#f4ece2]"><span className="w-5 text-center opacity-50">○</span><span className="truncate">{l.label}</span><Plus size={13} className="ml-auto hidden group-hover:block" /></button>); })}
                </div>))}
            </div>))}
          <div className="h-3" />
        </>}
        <div className="group flex items-center justify-between px-2 py-1 text-[11.5px] font-semibold text-ink-3"><span>Other pages</span><button title="New page" onClick={() => newPage()} className="rounded p-0.5 hover:bg-[#eadccb]"><Plus size={14} /></button></div>
        {found ? found.map((p) => <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex h-[30px] items-center gap-2 truncate rounded-md px-2 text-[13.5px] text-ink-2 hover:bg-[#f4ece2]"><span className="flex w-5 justify-center">{p.icon ? <PageIcon icon={p.icon} size={16} /> : "📄"}</span>{p.title}</Link>) : (kids.root || []).filter((p) => !menuPaths.has(p.path)).map((p) => <Row key={p.id} p={p} depth={0} />)}
        <button onClick={() => newPage()} className="mt-0.5 flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-[13.5px] text-ink-3 hover:bg-[#f4ece2]"><Plus size={14} />New page</button>
        {!found && <>
          <div className="mt-4 px-2 py-1 text-[11.5px] font-semibold text-ink-3">Library</div>
          <Link href="/admin/library/books" onClick={() => setMobile(false)} className={`flex h-[30px] items-center gap-2 rounded-md px-2 text-[13.5px] ${path === "/admin/library/books" ? "bg-[#f3e6d6] font-semibold" : "text-ink-2 hover:bg-[#f4ece2]"}`}><span className="w-5 text-center">📚</span>Books</Link>
          {lib.map((d) => <Link key={d.id} href={`/admin/databases/${d.id}`} onClick={() => setMobile(false)} className={`flex h-[30px] items-center gap-2 rounded-md px-2 text-[13.5px] ${path === `/admin/databases/${d.id}` ? "bg-[#f3e6d6] font-semibold" : "text-ink-2 hover:bg-[#f4ece2]"}`}><span className="w-5 text-center">{d.icon}</span><span className="flex-1 truncate">{d.name}</span><span className="text-[11.5px] text-ink-3">{d.rows || ""}</span></Link>)}
        </>}
        <div className="mt-4 flex items-center justify-between px-2 py-1 text-[11.5px] font-semibold text-ink-3"><span>Databases</span><Link href="/admin/databases" title="All databases" className="rounded p-0.5 hover:bg-[#eadccb]"><Plus size={14} /></Link></div>
        {dbs.filter((d) => !lib.some((l) => l.slug === d.slug)).map((d) => <Link key={d.id} href={`/admin/databases/${d.id}`} className={`flex h-[30px] items-center gap-2 truncate rounded-md px-2 text-[13.5px] ${path === `/admin/databases/${d.id}` ? "bg-[#f3e6d6] font-semibold" : "text-ink-2 hover:bg-[#f4ece2]"}`}><Database size={14} className="text-ink-3" />{d.name}</Link>)}
      </div>
      <div className="space-y-0.5 border-t border-[#ece2d4] p-2">
        <Nav href="/admin/media" icon={Img} label="Pictures & files" /><Nav href="/admin/announcements" icon={Megaphone} label="Announcements" />
        {(user.role === "owner" || user.role === "admin") && <><Nav href="/admin/users" icon={Users} label="People & roles" /><Nav href="/admin/settings" icon={Settings} label="Site settings" /></>}
        <a href="/" target="_blank" className="flex h-[30px] items-center gap-2 rounded-md px-2 text-[13.5px] text-ink-2 hover:bg-[#f4ece2]"><ExternalLink size={15} className="text-ink-3" />View website</a>
        <button onClick={async () => { await api("/api/admin/auth", "POST", { action: "logout" }); window.location.href = "/admin/login"; }} className="flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-[13.5px] text-ink-2 hover:bg-[#f4ece2]"><LogOut size={15} className="text-ink-3" />Sign out</button>
      </div>
    </div>
  );
  const wide = /^\/admin\/(pages|databases)\/[^/]+/.test(path);
  return (
    <div className="min-h-screen bg-white lg:pl-[260px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-[#ece2d4] lg:block">{side}</aside>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-2.5 lg:hidden"><button onClick={() => setMobile(true)} aria-label="Menu"><MenuIcon size={21} /></button><b className="text-[14px]">Studio</b></div>
      {mobile && <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobile(false)}><aside className="relative h-full w-[280px]" onClick={(e) => e.stopPropagation()}><button className="absolute right-2 top-3 z-10" onClick={() => setMobile(false)}><X size={18} /></button>{side}</aside></div>}
      {wide ? children : <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>}
    </div>
  );
}
