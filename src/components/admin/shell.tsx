"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, MoreHorizontal, Search, LayoutDashboard, Database, Image as Img, Megaphone, Users, Settings, LogOut, ExternalLink, Menu as MenuIcon, X, FileText, PanelsTopLeft, Trash2, ArrowUp, ArrowDown, Copy, Palette, Headphones, Music, Clapperboard, Quote, BookOpen, Languages, BookMarked, ChevronsUpDown, Globe, CalendarDays, NotebookPen, Newspaper, ToggleRight, Power, History } from "lucide-react";
import { api, toast } from "./ui";
import type { MenuJ } from "@/lib/menus";
import { ADMIN_GROUPS, groupOf } from "@/lib/admin-nav";
import { PageIcon } from "../page-icon";

type P = { id: string; parent_id: string | null; title: string; path: string; status: string; position: number; icon?: string; type: string; redirect?: string; studio?: string };

export function Shell({ user, children }: { user: { name: string; email: string; role: string }; children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const [pages, setPages] = useState<P[]>([]); const [menus, setMenus] = useState<MenuJ[]>([]); const [dbs, setDbs] = useState<{ id: string; name: string; slug: string }[]>([]); const [lib, setLib] = useState<{ id: string; slug: string; name: string; icon: string; group: string; rows: number }[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({}); const [q, setQ] = useState(""); const [mobile, setMobile] = useState(false);
  const load = useCallback(() => { api<P[]>("/api/admin/pages").then(setPages).catch(() => {}); api<MenuJ[]>("/api/admin/menus").then(setMenus).catch(() => {}); api("/api/admin/library").then(setLib).catch(() => {}); api("/api/admin/dbs").then(setDbs).catch(() => {}); }, []);
  useEffect(() => { load(); const h = () => load(); window.addEventListener("tj:pages-changed", h); return () => window.removeEventListener("tj:pages-changed", h); }, [load]);
  useEffect(() => { try { setOpen(JSON.parse(localStorage.getItem("tj_tree") || "{}")); } catch {} }, []);
  const toggle = (id: string) => setOpen((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem("tj_tree", JSON.stringify(n)); } catch {} return n; });
  const cur = /^\/admin\/pages\/([^/]+)/.exec(path)?.[1];
  // Only the group you are working in opens by itself; others open when clicked.
  const here = groupOf(path) || (/^\/admin\/(pages|databases)/.test(path) ? "website" : null);
  const isOpen = (k: string) => open["grp:" + k] ?? k === here;
  // keep the open page's ancestors expanded
  useEffect(() => { if (!cur || !pages.length) return; const byId = Object.fromEntries(pages.map((p) => [p.id, p])); let p = byId[cur]; const add: Record<string, boolean> = {}; while (p?.parent_id) { add[p.parent_id] = true; p = byId[p.parent_id]; } if (Object.keys(add).length) setOpen((o) => ({ ...o, ...add })); }, [cur, pages]);
  const kids = useMemo(() => { const m: Record<string, P[]> = {}; pages.filter((p) => p.studio !== "off").forEach((p) => { (m[p.parent_id || "root"] ||= []).push(p); }); Object.values(m).forEach((l) => l.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title))); return m; }, [pages]);
  const byPath = useMemo(() => Object.fromEntries(pages.map((p) => [p.path, p])), [pages]);
  const openAt = async (path: string, title: string) => { try { const r = await api<{ id: string }>("/api/admin/pages", "POST", { path, title }); load(); router.push(`/admin/pages/${r.id}`); setMobile(false); } catch (e: any) { toast(e.message, true); } };
  const newPage = async (parent?: string) => { const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: parent || null, template: "blank" }); if (parent) setOpen((o) => ({ ...o, [parent]: true })); load(); router.push(`/admin/pages/${r.id}`); setMobile(false); };
  const move = async (p: P, d: number) => { const sib = kids[p.parent_id || "root"] || []; const i = sib.findIndex((x) => x.id === p.id); const o = sib[i + d]; if (!o) return; await Promise.all(sib.map((x, k) => api(`/api/admin/pages/${x.id}`, "PATCH", { position: x.id === p.id ? i + d : x.id === o.id ? i : k }))); load(); };
  const del = async (p: P) => { if (!confirm(`Delete “${p.title}” and every page inside it? This cannot be undone.`)) return; await api(`/api/admin/pages/${p.id}`, "DELETE").catch((e) => toast(e.message, true)); load(); if (cur === p.id) router.push("/admin"); };
  const off = async (p: P) => { if (!confirm(`Turn off editing for “${p.title}”? It leaves the Pages list and the website shows the built-in page again (if there is one). Its content is kept; turn it back on from Website pages.`)) return; const src = await api(`/api/admin/pages/${p.id}`); await api(`/api/admin/pages/${p.id}`, "PATCH", { settings: { ...(src.settings || {}), studio: "off" } }); load(); if (cur === p.id) router.push("/admin/site-pages"); };
  const dup = async (p: P) => { const src = await api(`/api/admin/pages/${p.id}`); const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: p.parent_id, title: `${p.title} (copy)` }); await api(`/api/admin/pages/${r.id}`, "PATCH", { blocks: src.blocks, settings: src.settings, type: src.type }); load(); router.push(`/admin/pages/${r.id}`); };

  const Row = ({ p, depth }: { p: P; depth: number }) => {
    const [menu, setMenu] = useState(false); const ch = kids[p.id] || []; const on = cur === p.id;
    return (
      <div>
        <div className={`group relative flex h-8 items-center rounded-md pr-1 text-[13px] ${on ? "bg-zinc-200/70 font-medium text-zinc-950" : "text-zinc-700 hover:bg-zinc-200/50"}`} style={{ paddingLeft: 4 + depth * 14 }}>
          <button onClick={() => toggle(p.id)} aria-label="Expand" className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-3 hover:bg-zinc-300/60"><ChevronRight size={13} className={`transition ${open[p.id] ? "rotate-90" : ""} ${ch.length ? "" : "opacity-30"}`} /></button>
          <Link href={`/admin/pages/${p.id}`} onClick={() => setMobile(false)} className="flex min-w-0 flex-1 items-center gap-2 pl-0.5"><span className="flex w-5 shrink-0 justify-center text-[13px]">{p.icon ? <PageIcon icon={p.icon} size={16} /> : (p.type === "book" ? "📖" : p.type === "chapter" ? "📑" : <FileText size={14} className="mx-auto text-ink-3" />)}</span><span className="truncate">{p.title || "Untitled"}</span>{p.status !== "published" && <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9a441]" title="Draft" />}{p.redirect && <ExternalLink size={11} className="ml-1 shrink-0 text-ink-3" />}</Link>
          <span className="hidden items-center group-hover:flex">
            <button title="More" onClick={() => setMenu(!menu)} className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:bg-zinc-300/60"><MoreHorizontal size={14} /></button>
            <button title="Add a page inside" onClick={() => newPage(p.id)} className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:bg-zinc-300/60"><Plus size={14} /></button>
          </span>
          {menu && <div className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-line bg-white p-1 text-[12.5px] shadow-xl" onMouseLeave={() => setMenu(false)}>
            {[[ArrowUp, "Move up", () => move(p, -1)], [ArrowDown, "Move down", () => move(p, 1)], [Copy, "Duplicate", () => dup(p)], [ExternalLink, "View on site", () => window.open(p.path, "_blank")], [Power, "Turn off editing", () => off(p)], [Trash2, "Delete", () => del(p)]].map(([I, l, f]: any) => <button key={l} onClick={() => { setMenu(false); f(); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-band ${l === "Delete" ? "text-[#a3281e]" : ""}`}><I size={14} />{l}</button>)}
          </div>}
        </div>
        {open[p.id] && (ch.length ? ch.map((c) => <Row key={c.id} p={c} depth={depth + 1} />) : <p className="py-1 text-[12px] text-ink-3" style={{ paddingLeft: 30 + depth * 14 }}>No pages inside</p>)}
      </div>
    );
  };
  const found = q ? pages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : null;
  const Nav = ({ href, icon: I, label }: { href: string; icon: any; label: string }) => { const on = path === href || (href !== "/admin" && path.startsWith(href)); return <Link href={href} onClick={() => setMobile(false)} className={`flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition ${on ? "bg-zinc-200/70 font-medium text-zinc-950" : "text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-950"}`}><I className={`size-4 ${on ? "text-zinc-900" : "text-zinc-500"}`} />{label}</Link>; };

  const active = "bg-zinc-200/70 font-medium text-zinc-950";
  const item = "flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] text-zinc-700 outline-none transition hover:bg-zinc-200/50 hover:text-zinc-950 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-zinc-500";
  const Label = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => <div className="flex h-8 items-center justify-between px-2 text-[11.5px] font-medium text-zinc-500">{children}{action}</div>;
  const side = (
    <div className="flex h-full flex-col bg-zinc-50">
      <div className="p-2"><a href="/" target="_blank" className="flex items-center gap-2.5 rounded-md p-2 hover:bg-zinc-200/50">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png" alt="" className="size-8 rounded-lg" /><div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13px] font-semibold text-zinc-950">Taptajīvanam</p><p className="truncate text-[11.5px] text-zinc-500">Studio</p></div><ChevronsUpDown className="size-4 text-zinc-400" /></a>
        <div className="relative mt-1"><Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages…" className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-2 text-[12.5px] shadow-xs outline-none placeholder:text-zinc-400 focus:ring-[3px] focus:ring-zinc-400/30" /></div></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {found ? <div className="mt-1">{found.map((p) => <Link key={p.id} href={`/admin/pages/${p.id}`} onClick={() => setMobile(false)} className={item}><span className="flex w-4 justify-center">{p.icon ? <PageIcon icon={p.icon} size={15} /> : <FileText className="size-4 text-zinc-500" />}</span><span className="truncate">{p.title}</span></Link>)}{!found.length && <p className="px-2 py-2 text-[12.5px] text-zinc-500">No pages found.</p>}</div> : <>
        <div className="mt-1"><Nav href="/admin" icon={LayoutDashboard} label="Dashboard" /></div>
        {ADMIN_GROUPS.filter((g) => g.key !== "settings" || user.role === "owner" || user.role === "admin").map((g) => { const on = isOpen(g.key); return (
          <div key={g.key} className="mt-1">
            <button onClick={() => setOpen((o) => { const n = { ...o, ["grp:" + g.key]: !on }; try { localStorage.setItem("tj_tree", JSON.stringify(n)); } catch {} return n; })} className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-[12px] font-semibold text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900"><ChevronRight className={`size-3.5 transition ${on ? "rotate-90" : ""}`} /><span className="flex-1 text-left">{g.label}</span>{!on && groupOf(path) === g.key && <span className="size-1.5 rounded-full bg-zinc-900" />}</button>
            {on && <div className="ml-2 border-l border-zinc-200 pl-1.5">
              {g.links.map((l) => <Nav key={l.href} href={l.href} icon={l.icon} label={l.label} />)}
              {g.key === "website" && <>
                <div className="flex h-8 items-center justify-between pl-2 pr-1 text-[12px] font-medium text-zinc-500"><span className="flex items-center gap-2"><FileText className="size-4 text-zinc-500" />Pages you write</span><button title="New page" onClick={() => newPage()} className="rounded-md p-1 hover:bg-zinc-200/70"><Plus className="size-3.5" /></button></div>
                <div className="ml-2">{(kids.root || []).map((p) => <Row key={p.id} p={p} depth={0} />)}{!(kids.root || []).length && <p className="px-2 py-1 text-[12px] text-zinc-400">None yet. Turn one on in Website pages.</p>}</div>
                {dbs.filter((d) => !lib.some((x) => x.slug === d.slug)).map((d) => <Link key={d.id} href={`/admin/databases/${d.id}`} className={`${item} ${path === `/admin/databases/${d.id}` ? active : ""}`}><Database />{d.name}</Link>)}
              </>}
            </div>}
          </div>); })}
        </>}
      </div>
      <div className="border-t border-zinc-200 p-2">
        <div className="flex items-center gap-2 rounded-md p-2"><span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-[11.5px] font-semibold text-white">{(user.name || user.email).slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[12.5px] font-medium">{user.name || "You"}</p><p className="truncate text-[11.5px] text-zinc-500">{user.email}</p></div>
          <a href="/" target="_blank" title="View website" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/60"><Globe className="size-4" /></a>
          <button title="Sign out" onClick={async () => { await api("/api/admin/auth", "POST", { action: "logout" }); window.location.href = "/admin/login"; }} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/60"><LogOut className="size-4" /></button></div>
      </div>
    </div>
  );
  const wide = /^\/admin\/(pages|databases|books)\/[^/]+/.test(path);
  return (
    <div className="min-h-screen bg-white lg:pl-[256px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[256px] border-r border-zinc-200 lg:block">{side}</aside>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-2.5 lg:hidden"><button onClick={() => setMobile(true)} aria-label="Menu"><MenuIcon size={21} /></button><b className="text-[13px]">Studio</b></div>
      {mobile && <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobile(false)}><aside className="relative h-full w-[280px]" onClick={(e) => e.stopPropagation()}><button className="absolute right-2 top-3 z-10" onClick={() => setMobile(false)}><X size={18} /></button>{side}</aside></div>}
      {wide ? children : <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>}
    </div>
  );
}
