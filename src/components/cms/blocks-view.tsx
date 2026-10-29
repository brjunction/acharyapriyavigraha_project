import Link from "next/link";
import { ArrowRight, Play, Headphones } from "lucide-react";
import { VMask } from "../motifs";
import { sql } from "@/lib/db";
import { clean, slugify, type Block } from "@/lib/cms/blocks";

export const ALIGN: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" };
export const textCls = (d: Record<string, any>) =>
  `cms-text ${ALIGN[d.align || "left"]} ${d.size === "lg" ? "text-[18px] leading-[1.85]" : d.size === "sm" ? "text-[14px] leading-[1.7]" : "text-[16px] leading-[1.8]"} text-ink-2`;
export const headingCls = (d: Record<string, any>) =>
  `${ALIGN[d.align || "left"]} font-bold tracking-[-0.025em] text-ink ${d.level === 1 ? "text-[30px] sm:text-[38px] leading-[1.15]" : d.level === 3 ? "text-[19px] sm:text-[22px]" : d.level === 4 ? "text-[16px]" : "text-[23px] sm:text-[28px]"}`;
export const frameCls = (f: string) =>
  f === "gold" ? "p-1.5 bg-gradient-to-b from-[#e9b85f] via-[#fff1d0] to-[#e9b85f] rounded-2xl" : f === "indic" ? "p-2 rounded-2xl border-2 border-[#b9770e]/70 bg-[#fbf1de] outline outline-1 outline-offset-2 outline-[#b9770e]/40" : f === "shadow" ? "rounded-2xl shadow-[0_24px_50px_-24px_rgba(60,30,10,.45)]" : f === "round" ? "rounded-full overflow-hidden" : "";
export const widthCls = (w: string) => (w === "small" ? "max-w-xs" : w === "narrow" ? "max-w-xl" : w === "full" ? "max-w-none" : "max-w-3xl");
const alignBox = (a: string) => (a === "left" ? "mr-auto" : a === "right" ? "ml-auto" : "mx-auto");
export const ytId = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(u || "")?.[1] || "";

export function Rich({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean(html) }} />;
}

async function DatabaseBlock({ d }: { d: Record<string, any> }) {
  if (!d.db) return null;
  let rows: any[] = [], db: any = null;
  try {
    db = (await sql`select id, slug, name, fields from dbs where slug = ${d.db} and public`)[0];
    if (db) rows = await sql`select title, slug, data from db_rows where db_id = ${db.id} and status = 'published' order by position, created_at desc limit ${Number(d.limit) || 12}`;
  } catch {}
  if (!db) return null;
  const fields: { key: string; label: string }[] = (db.fields || []).slice(0, 5);
  return (
    <div>
      {d.title && <h3 className="mb-3 text-[19px] font-bold">{d.title}</h3>}
      {d.view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-band text-[12px] uppercase tracking-wider text-ink-3"><tr><th className="px-4 py-2.5">Title</th>{fields.map((f) => <th key={f.key} className="px-4 py-2.5">{f.label}</th>)}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r.slug || r.title} className="border-t border-line"><td className="px-4 py-2.5 font-medium">{r.slug ? <Link href={`/d/${db.slug}/${r.slug}`} className="hover:text-saffron">{r.title}</Link> : r.title}</td>{fields.map((f) => <td key={f.key} className="px-4 py-2.5 text-ink-2">{String(r.data?.[f.key] ?? "")}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div className={d.view === "cards" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "divide-y divide-line rounded-2xl border border-line bg-surface"}>
          {rows.map((r) => (
            <Link key={r.slug || r.title} href={r.slug ? `/d/${db.slug}/${r.slug}` : "#"} className={d.view === "cards" ? "card p-5 transition hover:-translate-y-0.5" : "flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-band/50"}>
              <span className="font-medium text-ink">{r.title}</span>
              {fields[0] && <span className="text-[13px] text-ink-3">{String(r.data?.[fields[0].key] ?? "")}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlockView({ block }: { block: Block }) {
  const d = block.data || {};
  switch (block.type) {
    case "heading": {
      const Tag = (`h${Math.min(4, Math.max(1, d.level || 2))}`) as "h1";
      return (
        <div className={`acc-${d.tone || "saffron"}`}>
          <Tag id={slugify(d.text || "")} className={headingCls(d)}>{d.text}</Tag>
          {d.rule !== false && <span className={`mt-3 block h-[3px] w-14 rounded-full bg-gradient-to-r from-[var(--acc)] to-transparent ${d.align === "center" ? "mx-auto" : d.align === "right" ? "ml-auto" : ""}`} />}
        </div>
      );
    }
    case "text": return <Rich html={d.html} className={textCls(d)} />;
    case "image": {
      if (!d.src) return null;
      return (
        <figure className={`${widthCls(d.width)} ${alignBox(d.align)}`}>
          <div className={frameCls(d.frame)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={d.src} alt={d.alt || ""} loading="lazy" className={`w-full ${d.frame === "round" ? "aspect-square object-cover" : "rounded-xl"}`} /></div>
          {d.caption && <figcaption className="mt-2 text-center text-[13px] text-ink-3">{d.caption}</figcaption>}
        </figure>
      );
    }
    case "gallery": {
      const cols = Math.min(5, Math.max(1, d.cols || 3));
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {(d.images || []).map((im: any, i: number) => <figure key={i} className={frameCls(d.frame)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={im.src} alt={im.alt || ""} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" /></figure>)}
        </div>
      );
    }
    case "quote":
      return (
        <blockquote className={d.style === "plain" ? "border-l-4 border-saffron pl-5" : "card relative overflow-hidden p-6 sm:p-8"}>
          <p className="text-[19px] font-medium leading-[1.6] tracking-[-0.01em] text-ink sm:text-[22px]">“{d.text}”</p>
          {d.source && <footer className="mt-3 text-[13px] font-medium text-saffron">— {d.source}</footer>}
        </blockquote>
      );
    case "callout":
      return <Rich html={d.html} className={`acc-${d.tone || "saffron"} cms-text rounded-2xl border border-[color-mix(in_srgb,var(--acc)_30%,white)] bg-[var(--acc-tint)] p-5 text-[15.5px] leading-[1.75] text-ink-2 sm:p-6`} />;
    case "cards":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(d.items || []).map((c: any, i: number) => (
            <Link key={i} href={c.href || "#"} className={`acc-${c.tone || "saffron"} card tile-hue group flex flex-col p-5`}>
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{c.title}</h3>
              <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-ink-2">{c.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--acc)]">Open<ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      );
    case "columns":
      return (
        <div className={`grid items-start gap-6 ${d.split === "wide-left" ? "md:grid-cols-[1.6fr_1fr]" : d.split === "wide-right" ? "md:grid-cols-[1fr_1.6fr]" : "md:grid-cols-2"}`}>
          {[["left", "leftImage"], ["right", "rightImage"]].map(([k, im]) => (
            <div key={k} className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {d[im] && <img src={d[im]} alt="" loading="lazy" className="w-full rounded-xl" />}
              <Rich html={d[k]} className={textCls(d)} />
            </div>
          ))}
        </div>
      );
    case "video": { const id = ytId(d.url); return id ? (
      <figure className="mx-auto max-w-3xl"><div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={d.caption || "Video"} loading="lazy" allowFullScreen className="h-full w-full" /></div>{d.caption && <figcaption className="mt-2 text-center text-[13px] text-ink-3">{d.caption}</figcaption>}</figure>
    ) : <div className="flex aspect-video max-w-3xl items-center justify-center rounded-2xl bg-band text-ink-3"><Play /></div>; }
    case "audio": return d.url ? (
      <div className="card mx-auto flex max-w-3xl items-center gap-4 p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron text-white"><Headphones size={20} /></span><div className="min-w-0 flex-1"><p className="truncate text-[14.5px] font-semibold">{d.title || "Audio"}</p><audio controls preload="none" src={d.url} className="mt-1 h-9 w-full" /></div></div>
    ) : null;
    case "button":
      return <div className={ALIGN[d.align || "left"]}><Link href={d.href || "#"} className={`acc-${d.tone || "saffron"} inline-flex h-11 items-center gap-2 rounded-full bg-[var(--acc)] px-6 text-[14.5px] font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-0.5`}>{d.label}<ArrowRight size={16} /></Link></div>;
    case "divider":
      return d.style === "line" ? <hr className="border-line" /> : d.style === "lotus" ? <div className="flex items-center justify-center gap-3 text-saffron/70"><span className="h-px w-24 bg-line-strong" /><span aria-hidden>❖</span><span className="h-px w-24 bg-line-strong" /></div> : <VMask name={d.style || "border-4"} repeat="repeat-x" size="auto 100%" className="mx-auto h-7 w-full max-w-3xl text-[#b9770e]/75" />;
    case "spacer": return <div style={{ height: Math.min(240, Math.max(8, d.h || 40)) }} aria-hidden />;
    case "toc": return null; // filled in by the page, which knows its headings
    case "database": return <DatabaseBlock d={d} />;
    default: return null;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  const heads = blocks.filter((b) => b.type === "heading" && b.data.level !== 1).map((b) => b.data.text as string);
  return (
    <div className="space-y-7">
      {blocks.map((b) => b.type === "toc"
        ? <nav key={b.id} className="card p-5"><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">On this page</p><ul className="mt-2 space-y-1.5 text-[14.5px]">{heads.map((h) => <li key={h}><a href={`#${slugify(h)}`} className="text-ink-2 hover:text-saffron">{h}</a></li>)}</ul></nav>
        : <BlockView key={b.id} block={b} />)}
    </div>
  );
}
