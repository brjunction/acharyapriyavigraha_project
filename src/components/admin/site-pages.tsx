"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ToggleRight, ExternalLink, Code2, PenLine } from "lucide-react";
import { Card, PageHeader, Badge, api, toast } from "./ui";
import type { MenuJ } from "@/lib/menus";
import { isDynamic, adminOf } from "@/lib/cms/dynamic";

type P = { id: string; path: string; title: string; status: string; studio?: string };

/** Every address on the website. Built pages stay as they are coded; switch one on to make it editable in Pages. */
export function SitePages() {
  const [menus, setMenus] = useState<MenuJ[]>([]); const [pages, setPages] = useState<P[]>([]); const [busy, setBusy] = useState("");
  const load = useCallback(() => { api<MenuJ[]>("/api/admin/menus").then(setMenus).catch((e) => toast(e.message, true)); api<P[]>("/api/admin/pages").then(setPages).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);
  const byPath = Object.fromEntries(pages.map((p) => [p.path, p]));
  const flip = async (href: string, label: string) => {
    setBusy(href); const pg = byPath[href];
    try {
      if (!pg) await api("/api/admin/pages", "POST", { path: href, title: label });
      else { const src = await api(`/api/admin/pages/${pg.id}`); await api(`/api/admin/pages/${pg.id}`, "PATCH", { settings: { ...(src.settings || {}), studio: pg.studio === "off" ? "on" : "off" } }); }
      window.dispatchEvent(new Event("tj:pages-changed")); load();
    } catch (e: any) { toast(e.message, true); } finally { setBusy(""); }
  };
  return (
    <div>
      <PageHeader icon={ToggleRight} title="Website pages" description="Pages are built in code by default. Switch one on only if you want to write it yourself in Pages; switch it off to go back to the built page. Nothing you wrote is lost when it is off." />
      <div className="space-y-6">
        {menus.map((m) => (
          <section key={m.key}>
            <h2 className="mb-2 text-[13px] font-semibold text-zinc-500">{m.label}</h2>
            <Card className="divide-y divide-zinc-100">
              {m.groups.flatMap((g) => g.links).filter((l, i, a) => l.href.startsWith("/") && a.findIndex((x) => x.href === l.href) === i).map((l) => {
                const pg = byPath[l.href]; const on = !!pg && pg.studio !== "off"; const dyn = isDynamic(l.href); const adm = adminOf(l.href);
                return (
                  <div key={l.href} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-zinc-900">{l.label}</span><span className="block truncate text-[11.5px] text-zinc-500">{l.href}</span></span>
                    {dyn ? <Link href={adm?.[0] || "/admin"} className="text-[12px] text-zinc-500 hover:text-zinc-900">Managed in {adm?.[1] || "its own section"} →</Link> : <>
                      <Badge tone={on ? "green" : "outline"}>{on ? <><PenLine className="mr-1 size-3" />Written in Pages</> : <><Code2 className="mr-1 size-3" />Built page</>}</Badge>
                      {on && pg && <Link href={`/admin/pages/${pg.id}`} className="text-[12px] text-zinc-600 hover:text-zinc-900">Edit</Link>}
                      <a href={l.href} target="_blank" title="View" className="text-zinc-400 hover:text-zinc-900"><ExternalLink className="size-4" /></a>
                      <button role="switch" aria-checked={on} disabled={busy === l.href} onClick={() => flip(l.href, l.label)} title={on ? "Turn editing off" : "Make editable in Pages"} className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-zinc-900" : "bg-zinc-300"} disabled:opacity-50`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} /></button>
                    </>}
                  </div>);
              })}
            </Card>
          </section>))}
      </div>
    </div>
  );
}
