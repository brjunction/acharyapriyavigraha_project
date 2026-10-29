/* A database shown on a public page: table, list, gallery or board. Server component. */
import Link from "next/link";
import { sql } from "@/lib/db";

type Field = { key: string; label: string; type: string; options?: string[] };
const fmt = (v: any, f: Field) => (v === undefined || v === null || v === "" ? "" : Array.isArray(v) ? v.join(", ") : f.type === "checkbox" ? (v ? "✓" : "") : f.type === "date" ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : String(v));

export async function DbView({ db, view = "table", title, limit = 50 }: { db: string; view?: string; title?: string; limit?: number }) {
  if (!db) return null;
  let d: any, rows: any[] = [];
  try {
    d = (await sql`select id, slug, name, fields from dbs where slug = ${db} and public`)[0];
    if (d) rows = await sql`select title, slug, data from db_rows where db_id = ${d.id} and status = 'published' order by position, created_at desc limit ${limit}`;
  } catch {}
  if (!d) return null;
  const fields: Field[] = (d.fields || []).filter((f: Field) => f.type !== "text").slice(0, 5);
  const href = (r: any) => `/d/${d.slug}/${r.slug}`;
  const img = (r: any) => { const f = (d.fields || []).find((x: Field) => x.type === "image" || x.type === "file"); return f ? r.data?.[f.key] : ""; };
  const head = title ? <h3 className="mb-3 text-[19px] font-bold tracking-[-0.02em]">{title}</h3> : null;
  if (!rows.length) return <>{head}<p className="rounded-2xl border border-dashed border-line p-6 text-center text-ink-3">Nothing here yet.</p></>;
  if (view === "gallery" || view === "cards") return <>{head}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((r) => <Link key={r.slug} href={href(r)} className="card overflow-hidden transition hover:-translate-y-0.5">{img(r) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img(r)} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-gradient-to-br from-[#fbeedd] to-[#f6dcb3]" />}<div className="p-4"><p className="font-semibold">{r.title}</p>{fields.slice(0, 2).map((f) => fmt(r.data?.[f.key], f) && <p key={f.key} className="mt-0.5 text-[13px] text-ink-3">{fmt(r.data?.[f.key], f)}</p>)}</div></Link>)}</div></>;
  if (view === "list") return <>{head}<ul className="divide-y divide-line rounded-2xl border border-line bg-surface">{rows.map((r) => <li key={r.slug}><Link href={href(r)} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-band/60"><span className="font-medium">{r.title}</span><span className="text-[13px] text-ink-3">{fields.slice(0, 2).map((f) => fmt(r.data?.[f.key], f)).filter(Boolean).join(" · ")}</span></Link></li>)}</ul></>;
  if (view === "board") {
    const g = (d.fields || []).find((f: Field) => f.type === "select");
    const groups = g ? [...(g.options || []), ""] : [""];
    return <>{head}<div className="flex gap-4 overflow-x-auto pb-2">{groups.map((o) => { const rs = rows.filter((r) => (g ? (r.data?.[g.key] || "") === o : true)); if (!rs.length) return null; return <div key={o || "none"} className="w-[260px] shrink-0 rounded-2xl bg-band/60 p-3"><p className="mb-2 text-[13px] font-semibold text-ink-2">{o || "Other"} <span className="text-ink-3">{rs.length}</span></p><div className="space-y-2">{rs.map((r) => <Link key={r.slug} href={href(r)} className="block rounded-xl border border-line bg-white p-3 text-[14px] font-medium hover:border-saffron">{r.title}</Link>)}</div></div>; })}</div></>;
  }
  return <>{head}<div className="overflow-x-auto rounded-2xl border border-line bg-surface"><table className="w-full text-left text-[14px]"><thead className="bg-band text-[12px] font-semibold text-ink-3"><tr><th className="px-4 py-2.5">Title</th>{fields.map((f) => <th key={f.key} className="px-4 py-2.5">{f.label}</th>)}</tr></thead><tbody>{rows.map((r) => <tr key={r.slug} className="border-t border-line"><td className="px-4 py-2.5 font-medium"><Link href={href(r)} className="hover:text-saffron">{r.title}</Link></td>{fields.map((f) => <td key={f.key} className="px-4 py-2.5 text-ink-2">{fmt(r.data?.[f.key], f)}</td>)}</tr>)}</tbody></table></div></>;
}
