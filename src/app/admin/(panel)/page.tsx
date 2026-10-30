import Link from "next/link";
import { sql } from "@/lib/db";
import { ADMIN_GROUPS } from "@/lib/admin-nav";

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

/** The Studio home: the same groups as the sidebar, as tiles with counts. */
export default async function Overview() {
  const n = await counts();
  return (
    <div>
      <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">Studio</h1>
      <p className="mt-1 text-[13px] text-zinc-500">Everything on the website is managed here, organised the same way as the website’s menus.</p>
      <div className="mt-8 space-y-9">
        {ADMIN_GROUPS.map((g) => (
          <section key={g.key}>
            <div className="mb-3 flex items-baseline gap-3"><h2 className="text-[14px] font-semibold text-zinc-900">{g.label}</h2><p className="text-[12.5px] text-zinc-500">{g.desc}</p></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.links.map(({ href, label, icon: I, desc }) => (
                <Link key={href} href={href} className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:shadow-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white"><I className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-medium text-zinc-900">{label}</span>{n[href] !== undefined && <span className="text-[11.5px] tabular-nums text-zinc-400">{n[href].toLocaleString()}</span>}</span><span className="mt-0.5 block truncate text-[12px] text-zinc-500">{desc}</span></span>
                </Link>))}
            </div>
          </section>))}
      </div>
    </div>
  );
}
