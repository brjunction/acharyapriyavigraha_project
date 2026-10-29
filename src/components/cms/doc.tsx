/* Renders a page document (the editor's block JSON) as clean, indexable HTML in the site's own style. Server-safe. */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { sql } from "@/lib/db";
import { ytId } from "./blocks-view";
import { DbView } from "./db-view";
import { PageIcon } from "../page-icon";
import { LectureCard } from "./lecture-card";
import { WidgetView, Styled, type LiveData } from "./widgets";
import { WIDGET } from "@/lib/cms/widget-defs";
import { getLectures } from "@/lib/cms/library";

export type Doc = DBlock[];
export type DBlock = { id: string; type: string; props: Record<string, any>; content?: any; children?: DBlock[] };

import { COLORS } from "@/lib/cms/colors";
export { COLORS };
const col = (c?: string, bg = false) => (c && c !== "default" ? (bg ? COLORS[c]?.bg : COLORS[c]?.text) : undefined);
const style = (p: Record<string, any>) => ({ color: col(p.textColor), backgroundColor: col(p.backgroundColor, true), textAlign: p.textAlignment && p.textAlignment !== "left" ? p.textAlignment : undefined } as React.CSSProperties);
const J1 = (v: any) => { try { return typeof v === "string" ? JSON.parse(v || "{}") : v || {}; } catch { return {}; } };
const J = (v: any) => { try { const x = typeof v === "string" ? JSON.parse(v || "[]") : v; return Array.isArray(x) ? x : []; } catch { return []; } };
const safeHref = (h: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(h || "") ? h : "#");

import { plainText, docText } from "./doc-text";
export { plainText, docText };
export const slugId = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
export function headings(doc: Doc) { return (doc || []).filter((b) => b.type === "heading" && b.props.level <= 3).map((b) => ({ level: b.props.level, text: plainText(b.content), id: slugId(plainText(b.content)) })); }

function Inline({ c }: { c: any }): ReactNode {
  if (!c) return null;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((x, i) => <Inline key={i} c={x} />);
  if (c.type === "link") return <Link href={safeHref(c.href)} className="font-medium text-saffron underline decoration-saffron/30 underline-offset-2 hover:decoration-saffron">{c.content?.map((x: any, i: number) => <Inline key={i} c={x} />)}</Link>;
  if (c.type !== "text") return null;
  const s = c.styles || {};
  let n: ReactNode = c.text;
  if (s.code) n = <code className="rounded bg-band px-1.5 py-0.5 font-mono text-[0.9em]">{n}</code>;
  if (s.bold) n = <strong>{n}</strong>;
  if (s.italic) n = <em>{n}</em>;
  if (s.underline) n = <u>{n}</u>;
  if (s.strike) n = <s>{n}</s>;
  if (s.textColor || s.backgroundColor) n = <span style={{ color: col(s.textColor), backgroundColor: col(s.backgroundColor, true), borderRadius: 3, padding: s.backgroundColor ? "0 2px" : undefined }}>{n}</span>;
  return n;
}

const H = ["", "text-[30px] sm:text-[36px] leading-[1.15] mt-10 mb-3", "text-[24px] sm:text-[28px] leading-tight mt-9 mb-2.5", "text-[19px] sm:text-[21px] mt-7 mb-2", "text-[17px] mt-6 mb-1.5", "text-[15.5px] mt-5 mb-1", "text-[14.5px] mt-4 mb-1"];

function Kids({ b }: { b: DBlock }) { return b.children?.length ? <div className="pl-6"><Render doc={b.children} /></div> : null; }

export type Ctx = { pageId?: string; path?: string };
async function Block({ b, n, toc, ctx }: { b: DBlock; n: number; toc?: ReactNode; ctx?: Ctx }): Promise<ReactNode> {
  const p = b.props || {};
  switch (b.type) {
    case "paragraph": {
      const empty = !plainText(b.content).trim();
      return <><p className="my-2.5 min-h-[1em] text-[16.5px] leading-[1.8] text-ink-2" style={style(p)}>{empty ? <br /> : <Inline c={b.content} />}</p><Kids b={b} /></>;
    }
    case "heading": {
      const L = Math.min(6, Math.max(1, p.level || 2)); const Tag = `h${L}` as "h2"; const text = plainText(b.content);
      const el = <Tag id={slugId(text)} className={`scroll-mt-24 font-bold tracking-[-0.025em] text-ink ${H[L]}`} style={style(p)}><Inline c={b.content} /></Tag>;
      return p.isToggleable ? <details className="group my-2"><summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{el}</summary>{b.children && <Render doc={b.children} />}</details> : el;
    }
    case "quote": return <blockquote className="my-5 border-l-[3px] border-saffron/70 bg-[#fdf6e8] py-3 pl-5 pr-4 text-[17.5px] italic leading-[1.75] text-ink" style={style(p)}><Inline c={b.content} /><Kids b={b} /></blockquote>;
    case "toggleListItem": return <details className="group my-1.5"><summary className="flex cursor-pointer list-none items-start gap-2 text-[16.5px] leading-[1.75] text-ink-2 [&::-webkit-details-marker]:hidden" style={style(p)}><span className="mt-[7px] inline-block border-y-[5px] border-l-[7px] border-y-transparent border-l-saffron transition group-open:rotate-90" /><span><Inline c={b.content} /></span></summary>{b.children && <div className="pl-6"><Render doc={b.children} /></div>}</details>;
    case "checkListItem": return <div className="my-1 flex items-start gap-2.5 text-[16.5px] leading-[1.75] text-ink-2" style={style(p)}><span className={`mt-[6px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded border ${p.checked ? "border-saffron bg-saffron text-white" : "border-line-strong"}`}>{p.checked && "✓"}</span><div className={p.checked ? "text-ink-3 line-through" : ""}><Inline c={b.content} /><Kids b={b} /></div></div>;
    case "codeBlock": return <pre className="my-5 overflow-x-auto rounded-2xl bg-[#2a1a0e] p-5 text-[13.5px] leading-relaxed text-[#f7e9d2]"><code>{plainText(b.content)}</code></pre>;
    case "divider": return <hr className="my-8 border-0 border-t border-line" />;
    case "pageBreak": return <div className="my-8" />;
    case "table": {
      const t = b.content; if (!t?.rows) return null; const hr = t.headerRows || 0;
      return <div className="my-6 overflow-x-auto rounded-2xl border border-line"><table className="w-full border-collapse text-left text-[14.5px]"><tbody>{t.rows.map((r: any, i: number) => <tr key={i} className={i < hr ? "bg-band font-semibold" : "border-t border-line"}>{r.cells.map((c: any, j: number) => { const cell = Array.isArray(c) ? { content: c, props: {} } : c; const C = i < hr ? "th" : "td"; return <C key={j} colSpan={cell.props?.colspan} rowSpan={cell.props?.rowspan} className="px-4 py-2.5 align-top text-ink-2" style={style(cell.props || {})}><Inline c={cell.content} /></C>; })}</tr>)}</tbody></table></div>;
    }
    case "image": {
      if (!p.url) return null;
      const w = p.previewWidth ? { maxWidth: p.previewWidth } : undefined;
      return <figure className={`my-7 ${p.textAlignment === "left" ? "" : p.textAlignment === "right" ? "ml-auto" : "mx-auto"}`} style={w}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.url} alt={p.caption || p.name || ""} loading="lazy" className="w-full rounded-2xl" />{p.caption && <figcaption className="mt-2 text-center text-[13px] text-ink-3">{p.caption}</figcaption>}</figure>;
    }
    case "video": {
      const y = ytId(p.url); if (!p.url) return null;
      return <figure className="my-7">{y ? <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${y}`} title={p.caption || "Video"} loading="lazy" allowFullScreen className="h-full w-full" /></div> : <video src={p.url} controls className="w-full rounded-2xl" />}{p.caption && <figcaption className="mt-2 text-center text-[13px] text-ink-3">{p.caption}</figcaption>}</figure>;
    }
    case "audio": return p.url ? <figure className="my-6 rounded-2xl border border-line bg-surface p-4">{p.name && <p className="mb-2 text-[14px] font-semibold">{p.name}</p>}<audio src={p.url} controls preload="none" className="w-full" />{p.caption && <figcaption className="mt-2 text-[13px] text-ink-3">{p.caption}</figcaption>}</figure> : null;
    case "file": return p.url ? <a href={p.url} className="my-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 font-medium hover:border-saffron">📄 {p.name || p.caption || "Download file"}</a> : null;
    // ---- Taptajivanam blocks
    case "callout": return <div className="my-5 flex gap-3 rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: COLORS[p.tone || "orange"]?.bg, borderColor: `color-mix(in srgb, ${COLORS[p.tone || "orange"]?.text} 22%, white)` }}><span className="text-[20px] leading-[1.6]">{p.icon || "🪷"}</span><div className="min-w-0 flex-1 text-[16px] leading-[1.75] text-ink"><Inline c={b.content} />{b.children && <Render doc={b.children} />}</div></div>;
    case "sloka": return <figure className="my-7 rounded-2xl border border-[#e3cf9f] bg-[#fdf6e8] px-6 py-6 text-center"><p className="whitespace-pre-line text-[18px] font-medium leading-[1.8] text-[#7a3a06]"><Inline c={b.content} /></p>{p.source && <figcaption className="mt-3 text-[13px] font-medium text-saffron">{p.source}</figcaption>}</figure>;
    case "pullQuote": return <figure className="card my-7 p-6 sm:p-8"><p className="text-[20px] font-medium leading-[1.6] text-ink sm:text-[22px]">“<Inline c={b.content} />”</p>{p.source && <figcaption className="mt-3 text-[13px] font-medium text-saffron">{p.source}</figcaption>}</figure>;
    case "ornament": return <div aria-hidden className="my-8 flex items-center justify-center gap-3 text-[#c98a2b]"><span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e3cf9f]" /><span className="text-[18px]">{p.style === "lotus" ? "❀" : p.style === "dots" ? "• • •" : "✦"}</span><span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e3cf9f]" /></div>;
    case "button": return <div className="my-6" style={{ textAlign: p.align || "left" }}><Link href={safeHref(p.href)} className="inline-flex h-11 items-center rounded-full bg-saffron px-6 text-[14.5px] font-medium text-white">{p.label || "Open"}</Link></div>;
    case "youtube": { const y = ytId(p.url); return y ? <figure className="my-7"><div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${y}`} title={p.caption || "Video"} loading="lazy" allowFullScreen className="h-full w-full" /></div>{p.caption && <figcaption className="mt-2 text-center text-[13px] text-ink-3">{p.caption}</figcaption>}</figure> : null; }
    case "gallery": { let imgs: { url: string; caption?: string }[] = []; try { imgs = JSON.parse(p.images || "[]"); } catch {} return imgs.length ? <div className="my-7 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(Number(p.cols) || 3, 4)}, minmax(0,1fr))` }}>{imgs.map((im, i) => <figure key={i}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={im.url} alt={im.caption || ""} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />{im.caption && <figcaption className="mt-1 text-[12px] text-ink-3">{im.caption}</figcaption>}</figure>)}</div> : null; }
    case "subpage": { if (!p.pageId) return null; const r = (await sql`select title, path, settings from pages where id = ${p.pageId} and status='published'`.catch(() => []))[0]; return r ? <Link href={r.path as string} className="my-1.5 flex items-center gap-2.5 rounded-xl px-2 py-2 text-[16px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:bg-band"><PageIcon icon={(r.settings as any)?.icon || "📄"} size={19} />{r.title as string}</Link> : null; }
    case "database": return <div className="my-7"><DbView db={p.db} view={p.view} title={p.title} limit={Number(p.limit) || 50} /></div>;
    case "toc": return toc || null;
    case "widget": {
      const def = WIDGET[p.kind]; if (!def) return null;
      const d = J1(p.data), st = J1(p.style); const live: LiveData = {};
      try {
        if (p.kind === "pageList") {
          const rows = d.path ? await sql`select c.title, c.path, c.settings, c.blocks from pages c join pages par on c.parent_id = par.id where par.path = ${d.path} and c.status = 'published' order by c.position, c.title` : ctx?.pageId ? await sql`select title, path, settings, blocks from pages where parent_id = ${ctx.pageId} and status = 'published' order by position, title` : [];
          live.pages = rows.map((r: any) => ({ title: r.title, path: r.path, icon: r.settings?.icon, cover: r.settings?.cover, text: docText(r.blocks || [], 120) }));
        } else if (p.kind === "latest") {
          const rows = await sql`select r.title, r.slug, r.data, d.slug as db from db_rows r join dbs d on d.id = r.db_id where d.slug = ${d.collection || "audio-lectures"} and r.status = 'published' order by r.created_at desc limit ${Math.min(30, Number(d.count) || 6)}`;
          live.latest = rows.map((r: any) => ({ title: r.title, href: `/d/${r.db}/${r.slug}`, sub: [r.data?.date, r.data?.place, r.data?.source].filter(Boolean).join(" · "), text: r.data?.text }));
        } else if (p.kind === "quoteOfDay") {
          const c = Number((await sql`select count(*)::int as n from db_rows r join dbs d on d.id = r.db_id where d.slug = 'quotes' and r.status = 'published'`)[0]?.n) || 0;
          if (c) { const day = Math.floor(Date.now() / 864e5) % c; const q = (await sql`select r.title, r.slug, r.data from db_rows r join dbs d on d.id = r.db_id where d.slug = 'quotes' and r.status = 'published' order by r.created_at offset ${day} limit 1`)[0]; if (q) live.quote = { text: (q.data as any)?.text || (q.title as string), source: (q.data as any)?.source || "", href: `/d/quotes/${q.slug}` }; }
        }
      } catch {}
      return <Styled s={st}><WidgetView kind={p.kind} d={d} live={live} id={String(b.id || n)} /></Styled>;
    }
    case "timeline": { const items = J(p.items); return items.length ? <ol className="my-8 ml-2 border-l-2 border-[#e3cf9f]">{items.map((it: any, i: number) => <li key={i} className="relative pb-7 pl-7 last:pb-0"><span className="absolute -left-[8px] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-saffron shadow-[0_0_0_2px_#e3cf9f]" /><p className="text-[12px] font-bold uppercase tracking-[0.12em] text-saffron">{it.year}</p>{it.title && <p className="mt-0.5 text-[17px] font-semibold text-ink">{it.title}</p>}{it.text && <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{it.text}</p>}</li>)}</ol> : null; }
    case "verse": return <figure className="my-8 rounded-3xl border border-[#e3cf9f] bg-[#fdf6e8] px-6 py-7 sm:px-10">{p.reference && <figcaption className="mb-3 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-saffron">{p.reference}</figcaption>}{p.original && <p className="whitespace-pre-line text-center text-[19px] leading-[1.9] text-[#7a3a06]">{p.original}</p>}{p.transliteration && <p className="mt-3 whitespace-pre-line text-center text-[15.5px] italic leading-[1.85] text-ink-2">{p.transliteration}</p>}{p.translation && <><div className="mx-auto my-5 h-px w-24 bg-[#e3cf9f]" /><p className="text-[16.5px] font-medium leading-[1.75] text-ink"><span className="mr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-saffron">Translation</span>{p.translation}</p></>}{p.purport && <p className="mt-3 whitespace-pre-line text-[15.5px] leading-[1.8] text-ink-2">{p.purport}</p>}</figure>;
    case "imageText": return <div className={`my-8 flex flex-col gap-6 sm:items-center ${p.side === "right" ? "sm:flex-row-reverse" : "sm:flex-row"}`}>{p.url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.url} alt={p.caption || ""} loading="lazy" className="w-full rounded-2xl sm:w-[42%]" />}<div className="min-w-0 flex-1 text-[16.5px] leading-[1.8] text-ink-2"><Inline c={b.content} /></div></div>;
    case "linkCards": { const items = J(p.items); return items.length ? <div className={`lc-${String(b.id).replace(/[^a-z0-9-]/gi, "")} my-7 grid gap-4 sm:grid-cols-2`}><style>{`@media(min-width:1024px){.lc-${String(b.id).replace(/[^a-z0-9-]/gi, "")}{grid-template-columns:repeat(${Math.min(4, Number(p.cols) || 3)},minmax(0,1fr))}}`}</style>{items.map((it: any, i: number) => <Link key={i} href={safeHref(it.href || "#")} className="card group block overflow-hidden transition hover:-translate-y-0.5">{it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />}<div className="p-5"><p className="text-[16px] font-semibold group-hover:text-saffron">{it.title}</p>{it.text && <p className="mt-1 text-[14px] leading-relaxed text-ink-3">{it.text}</p>}</div></Link>)}</div> : null; }
    case "faq": { const items = J(p.items).filter((x: any) => x.q); return items.length ? <div className="my-7 divide-y divide-line rounded-2xl border border-line bg-surface"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((x: any) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a || "" } })) }) }} />{items.map((x: any, i: number) => <details key={i} className="group px-5 py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-semibold text-ink [&::-webkit-details-marker]:hidden">{x.q}<span className="text-saffron transition group-open:rotate-45">+</span></summary><p className="mt-2 whitespace-pre-line text-[15.5px] leading-[1.75] text-ink-2">{x.a}</p></details>)}</div> : null; }
    case "stats": { const items = J(p.items); return items.length ? <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map((x: any, i: number) => <div key={i} className="rounded-2xl border border-[#ead7ae] bg-[#fdf6e8] p-5 text-center"><p className="text-[30px] font-bold tracking-[-0.03em] text-saffron">{x.n}</p><p className="mt-0.5 text-[13.5px] text-ink-2">{x.label}</p></div>)}</div> : null; }
    case "banner": return <section className="relative my-9 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12" style={{ background: COLORS[p.tone || "orange"]?.bg }}>{p.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}<div className="relative">{p.title && <h2 className="text-[26px] font-bold tracking-[-0.025em] text-ink sm:text-[32px]">{p.title}</h2>}{p.text && <p className="mx-auto mt-2 max-w-xl text-[16px] leading-relaxed text-ink-2">{p.text}</p>}{p.label && p.href && <Link href={safeHref(p.href)} className="mt-5 inline-flex h-11 items-center rounded-full bg-saffron px-6 text-[14.5px] font-medium text-white">{p.label}</Link>}</div></section>;
    case "chapters": {
      if (!p.pageId) return null;
      const kids = await sql`select title, path, settings from pages where parent_id = ${p.pageId} and status = 'published' order by position, title`.catch(() => [] as any[]);
      if (!kids.length) return null;
      return p.style === "cards" ? <div className="my-8 grid gap-3 sm:grid-cols-2">{kids.map((k: any, i: number) => <Link key={k.path} href={k.path} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdf6e8] text-[15px] font-bold text-saffron ring-1 ring-[#e3cf9f]">{i + 1}</span><span className="text-[16px] font-semibold group-hover:text-saffron">{k.title}</span></Link>)}</div>
        : <nav aria-label="Chapters" className="my-8 rounded-3xl border border-[#e3cf9f] bg-[#fdfaf3] p-6 sm:p-8"><p className="mb-4 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-saffron">Contents</p><ol className="space-y-1">{kids.map((k: any, i: number) => <li key={k.path}><Link href={k.path} className="group flex items-baseline gap-3 rounded-lg px-2 py-2 hover:bg-white"><span className="w-8 shrink-0 text-right text-[14px] font-bold text-saffron">{i + 1}.</span><span className="flex-1 border-b border-dotted border-[#d9c39a] pb-0.5 text-[16px] font-medium text-ink group-hover:text-saffron">{k.title}</span></Link></li>)}</ol></nav>;
    }
    case "lecture": { if (!p.slug) return null; const l = (await getLectures())?.find((x) => x.slug === p.slug); return l ? <LectureCard l={l} /> : null; }
    case "bulletListItem": case "numberedListItem": return null; // grouped below
    default: return null;
  }
}

/** Renders a document. Neighbouring list items are grouped into one list. */
export function Render({ doc, toc, ctx }: { doc: Doc; toc?: ReactNode; ctx?: Ctx }) {
  const out: ReactNode[] = []; let i = 0;
  const list = doc || [];
  while (i < list.length) {
    const b = list[i];
    if (b.type === "bulletListItem" || b.type === "numberedListItem") {
      const t = b.type; const items: DBlock[] = [];
      while (i < list.length && list[i].type === t) items.push(list[i++]);
      const L = t === "bulletListItem" ? "ul" : "ol";
      out.push(<L key={b.id} start={t === "numberedListItem" ? items[0].props?.start : undefined} className={`my-3 space-y-1.5 pl-6 text-[16.5px] leading-[1.75] text-ink-2 ${L === "ul" ? "list-disc marker:text-saffron" : "list-decimal marker:font-semibold marker:text-saffron"}`}>{items.map((it) => <li key={it.id} style={style(it.props || {})}><Inline c={it.content} />{it.children?.length ? <Render doc={it.children} /> : null}</li>)}</L>);
      continue;
    }
    out.push(<Fragment key={b.id || i}><Block b={b} n={i} toc={toc} ctx={ctx} /></Fragment>); i++;
  }
  return <>{out}</>;
}
