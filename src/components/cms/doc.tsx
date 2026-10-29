/* Renders a page document (the editor's block JSON) as clean, indexable HTML in the site's own style. Server-safe. */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { sql } from "@/lib/db";
import { ytId } from "./blocks-view";
import { DbView } from "./db-view";

export type Doc = DBlock[];
export type DBlock = { id: string; type: string; props: Record<string, any>; content?: any; children?: DBlock[] };

export const COLORS: Record<string, { text: string; bg: string }> = {
  default: { text: "inherit", bg: "transparent" },
  gray: { text: "#7a6e64", bg: "#f1ece6" }, brown: { text: "#7a4a24", bg: "#f4e7da" }, red: { text: "#b0281e", bg: "#fbe4e1" },
  orange: { text: "#c25d06", bg: "#fdebd6" }, yellow: { text: "#a37200", bg: "#fbf1cc" }, green: { text: "#2f6b3f", bg: "#e3f1e5" },
  blue: { text: "#2a4f9a", bg: "#e2eaf8" }, purple: { text: "#6c3f9e", bg: "#efe6f7" }, pink: { text: "#a3365a", bg: "#f9e3ea" },
};
const col = (c?: string, bg = false) => (c && c !== "default" ? (bg ? COLORS[c]?.bg : COLORS[c]?.text) : undefined);
const style = (p: Record<string, any>) => ({ color: col(p.textColor), backgroundColor: col(p.backgroundColor, true), textAlign: p.textAlignment && p.textAlignment !== "left" ? p.textAlignment : undefined } as React.CSSProperties);
const safeHref = (h: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(h || "") ? h : "#");

export function plainText(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => (c.type === "link" ? plainText(c.content) : c.text || "")).join("");
  if (content.type === "tableContent") return content.rows.map((r: any) => r.cells.map((c: any) => plainText(Array.isArray(c) ? c : c.content)).join(" ")).join(" ");
  return "";
}
export function docText(doc: Doc, max = 155) {
  const out: string[] = [];
  const walk = (bs: DBlock[]) => bs.forEach((b) => { if (!["heading"].includes(b.type)) out.push(plainText(b.content)); if (b.children) walk(b.children); });
  walk(doc || []);
  return out.join(" ").replace(/\s+/g, " ").trim().slice(0, max);
}
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

async function Block({ b, n, toc }: { b: DBlock; n: number; toc?: ReactNode }): Promise<ReactNode> {
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
    case "subpage": { if (!p.pageId) return null; const r = (await sql`select title, path, settings from pages where id = ${p.pageId} and status='published'`.catch(() => []))[0]; return r ? <Link href={r.path as string} className="my-1.5 flex items-center gap-2.5 rounded-xl px-2 py-2 text-[16px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:bg-band"><span className="text-[18px]">{(r.settings as any)?.icon || "📄"}</span>{r.title as string}</Link> : null; }
    case "database": return <div className="my-7"><DbView db={p.db} view={p.view} title={p.title} limit={Number(p.limit) || 50} /></div>;
    case "toc": return toc || null;
    case "bulletListItem": case "numberedListItem": return null; // grouped below
    default: return null;
  }
}

/** Renders a document. Neighbouring list items are grouped into one list. */
export function Render({ doc, toc }: { doc: Doc; toc?: ReactNode }) {
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
    out.push(<Fragment key={b.id || i}><Block b={b} n={i} toc={toc} /></Fragment>); i++;
  }
  return <>{out}</>;
}
