import Link from "next/link";
import { sql } from "@/lib/db";
import { FileText, Image as Img, Database, Users, Plus } from "lucide-react";

export default async function Overview() {
  const [p, m, d, u, recent] = await Promise.all([
    sql`select count(*)::int c, count(*) filter (where status='published')::int live from pages`,
    sql`select count(*)::int c from media`, sql`select count(*)::int c from dbs`, sql`select count(*)::int c from users`,
    sql`select id, title, status, updated_at from pages order by updated_at desc limit 6`,
  ]);
  const stats = [[FileText, `${p[0].live} live / ${p[0].c}`, "Pages", "/admin/pages"], [Img, m[0].c, "Pictures", "/admin/media"], [Database, d[0].c, "Databases", "/admin/databases"], [Users, u[0].c, "People", "/admin/users"]] as const;
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-[-0.03em]">Welcome</h1>
      <p className="mb-6 mt-1 text-ink-3">Everything on the website is made from here. No programmer needed.</p>
      <div className="grid gap-3 sm:grid-cols-4">{stats.map(([I, n, l, h]) => <Link key={l} href={h} className="card p-4 transition hover:-translate-y-0.5"><I size={20} className="mb-3 text-saffron" /><p className="text-[20px] font-bold">{String(n)}</p><p className="text-[12.5px] text-ink-3">{l}</p></Link>)}</div>
      <div className="mt-8 flex items-center justify-between"><h2 className="text-[15.5px] font-bold">Recently edited</h2><Link href="/admin/pages?new=1" className="inline-flex items-center gap-1.5 rounded-xl bg-saffron px-4 py-2 text-[13px] font-medium text-white"><Plus size={15} />New page</Link></div>
      <div className="card mt-3 divide-y divide-line">{recent.length ? recent.map((r) => <Link key={r.id as string} href={`/admin/pages/${r.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-band/60"><span className="font-medium">{r.title as string}</span><span className="text-[12px] text-ink-3">{r.status === "published" ? "Live" : "Draft"} · {new Date(r.updated_at as string).toLocaleDateString()}</span></Link>) : <p className="p-5 text-ink-3">Nothing yet. Make your first page.</p>}</div>
    </div>
  );
}
