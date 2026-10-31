import Link from "next/link";
import { sql } from "@/lib/db";
import { ADMIN_GROUPS } from "@/lib/admin-nav";
import { Globe, BookMarked, PenLine, LayoutTemplate, ArrowRight } from "lucide-react";

async function counts(): Promise<Record<string, number>> {
  const q = async (s: Promise<any[]>) => { try { return await s; } catch { return []; } };
  const [a, t] = await Promise.all([
    q(sql`select collection, count(*)::int n from archive_items group by 1`),
    q(sql`select (select count(*) from audios where kind not in ('kirtan','bhajan'))::int audio, (select count(*) from audios where kind in ('kirtan','bhajan'))::int kirtans, (select count(*) from videos)::int videos, (select count(*) from books)::int books, (select count(*) from articles)::int articles, (select count(*) from magazines)::int magazines, (select count(*) from diary_entries)::int diary, (select count(*) from life_events)::int timeline, (select count(*) from calendar_events)::int calendar, (select count(*) from media)::int media, (select count(*) from users)::int users`),
  ]);
  const o: Record<string, number> = {}; a.forEach((r: any) => (o[`/admin/archive/${r.collection}`] = r.n));
  const r = t[0] || {}; for (const [k, v] of Object.entries(r)) o[`/admin/${k}`] = Number(v);
  return o;
}

/** The Studio home: quick actions, the main numbers, then the same groups as the sidebar, as tiles with counts. */
export default async function Overview() {
  const n = await counts();
  const big: [string, string, number, string][] = [["Audio lectures", "/admin/audio", n["/admin/audio"] || 0, "#1a73e8"], ["Books", "/admin/books", n["/admin/books"] || 0, "#137333"], ["Videos", "/admin/videos", n["/admin/videos"] || 0, "#b3261e"], ["Diary pages", "/admin/diary", n["/admin/diary"] || 0, "#b06000"]];
  const quick: [string, string, any][] = [["Open the website", "/", Globe], ["Open the WebFolio", "/webfolio", BookMarked], ["Write a WebFolio page", "/admin/pages", PenLine], ["Home page design", "/admin/settings", LayoutTemplate]];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-[26px] font-semibold tracking-[-0.025em] text-zinc-950">Studio</h1><p className="mt-1 text-[13.5px] text-zinc-500">Everything on the website and the WebFolio, organised the same way as the website’s menus.</p></div>
        <div className="flex flex-wrap gap-2">{quick.map(([l, h, I]) => <Link key={h} href={h} target={h.startsWith("/admin") ? undefined : "_blank"} className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 text-[13px] font-medium text-zinc-800 shadow-xs transition hover:border-zinc-300 hover:bg-zinc-50"><I className="size-4 text-zinc-500" />{l}</Link>)}</div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{big.map(([l, h, v, c]) => <Link key={h} href={h} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,.3)]"><span className="block h-1 w-8 rounded-full" style={{ background: c }} /><p className="mt-3 text-[28px] font-semibold tabular-nums tracking-tight text-zinc-950">{v.toLocaleString()}</p><p className="flex items-center justify-between text-[13px] text-zinc-500">{l}<ArrowRight className="size-3.5 opacity-0 transition group-hover:opacity-100" /></p></Link>)}</div>
      <div className="mt-10 space-y-10">
        {ADMIN_GROUPS.map((g) => (
          <section key={g.key}>
            <div className="mb-3 flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg text-white shadow-sm" style={{ background: g.color }}><g.icon className="size-4" /></span><div><h2 className="text-[15px] font-semibold text-zinc-950">{g.label}</h2><p className="text-[12.5px] text-zinc-500">{g.desc}</p></div></div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.links.map(({ href, label, icon: I, desc }) => (
                <Link key={href} href={href} className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 transition hover:-translate-y-px hover:border-zinc-300 hover:shadow-[0_8px_22px_-14px_rgba(0,0,0,.3)]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg transition" style={{ background: `${g.color}14`, color: g.color }}><I className="size-[18px]" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13.5px] font-semibold text-zinc-900">{label}</span>{n[href] !== undefined && <span className="rounded-full bg-zinc-100 px-1.5 text-[11px] font-medium tabular-nums text-zinc-600">{n[href].toLocaleString()}</span>}</span><span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{desc}</span></span>
                </Link>))}
            </div>
          </section>))}
      </div>
    </div>
  );
}
