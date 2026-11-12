/* HTML (from an EPUB chapter or a Word file) → paragraphs with their bold, italic, headings and alignment.
   A small tolerant reader of its own: no browser DOM needed, so it also runs in tests. */
import { type Para, type Run, tidyRuns, plain } from "./types";
import { tidyText } from "./balaram";

export type Css = Record<string, Record<string, string>>;
/** ".block_3 { text-align: center; font-weight: bold }" → { block_3: { "text-align": "center", … } } (class and tag rules only) */
export function parseCss(css: string): Css {
  const out: Css = {};
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const props: Record<string, string> = {}; for (const d of m[2].split(";")) { const k = d.indexOf(":"); if (k > 0) props[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim().toLowerCase(); }
    for (const sel of m[1].split(",")) { const s = sel.trim(); const c = /^(?:[a-z0-9]+)?\.([\w-]+)$/i.exec(s) || /^([a-z][a-z0-9]*)$/i.exec(s); if (c) out[(s.includes(".") ? "." : "") + c[1].toLowerCase()] = { ...(out[(s.includes(".") ? "." : "") + c[1].toLowerCase()] || {}), ...props }; }
  }
  return out;
}
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", copy: "©", shy: "" };
const unent = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => (e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e] ?? m));
const attr = (tag: string, name: string) => { const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(tag); return m ? unent(m[2] ?? m[3] ?? "") : ""; };
const BLOCK = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "pre", "td", "th", "dt", "dd", "section", "article", "body", "tr", "table", "ul", "ol", "figure", "figcaption", "header", "footer", "aside", "center"]);
type St = { b?: 1; i?: 1; u?: 1; sup?: 1; align?: Para["align"]; h?: number; quote?: 1; big?: number };

export type HtmlPara = Para & { id?: string; ids?: string[]; size?: number };
/** Reads one HTML document. `anchors` (ids the table of contents points at) are kept on the paragraph that carries them. */
export function htmlToParas(html: string, css: Css = {}): HtmlPara[] {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;
  const out: HtmlPara[] = []; let runs: Run[] = []; let cur: St = {}; let ids: string[] = []; let pre = 0;
  const stack: { tag: string; st: St }[] = [];
  const styleOf = (tag: string, raw: string, base: St): St => {
    const st: St = { ...base }; const props: Record<string, string> = { ...(css[tag] || {}) };
    for (const c of attr(raw, "class").split(/\s+/)) if (c) Object.assign(props, css["." + c.toLowerCase()] || {});
    for (const d of attr(raw, "style").split(";")) { const k = d.indexOf(":"); if (k > 0) props[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim().toLowerCase(); }
    if (tag === "b" || tag === "strong") st.b = 1; if (tag === "i" || tag === "em" || tag === "cite") st.i = 1; if (tag === "u") st.u = 1; if (tag === "sup") st.sup = 1;
    if (tag === "center") st.align = "center"; if (tag === "blockquote") st.quote = 1;
    const hm = /^h([1-6])$/.exec(tag); if (hm) st.h = Number(hm[1]);
    const w = props["font-weight"]; if (w) { if (w === "bold" || w === "bolder" || Number(w) >= 600) st.b = 1; else if (w === "normal" || Number(w) <= 500) delete st.b; }
    const fs = props["font-style"]; if (fs) { if (fs.includes("italic") || fs.includes("oblique")) st.i = 1; else if (fs === "normal") delete st.i; }
    if ((props["text-decoration"] || props["text-decoration-line"] || "").includes("underline")) st.u = 1;
    if ((props["vertical-align"] || "").includes("super")) st.sup = 1;
    const ta = props["text-align"] || attr(raw, "align").toLowerCase(); if (ta === "center" || ta === "right" || ta === "justify") st.align = ta; else if (ta === "left" || ta === "start") delete st.align;
    const sz = props["font-size"]; if (sz) { const m = /^([\d.]+)(em|rem|%)$/.exec(sz); if (m) st.big = (st.big || 1) * (m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])); }
    return st;
  };
  let blockSt: St = {};
  /* `spacer`: an element that was closed with nothing in it is a deliberate empty line (it separates verses);
     stray white space between two elements is nothing. */
  const flush = (spacer = false) => {
    const r = tidyRuns(runs.map((x) => ({ ...x, t: tidyText(x.t) }))); runs = [];
    const text = plain(r).trim();
    if (!text) { if (spacer && !(out.length && !out[out.length - 1].runs.length && out[out.length - 1].kind === "p")) { out.push({ kind: "p", runs: [], ids: ids.length ? ids : undefined }); ids = []; } return; }
    const st = blockSt; const p: HtmlPara = { kind: st.h ? "h" : st.quote ? "quote" : "p", runs: r };
    if (st.h) p.level = Math.min(4, st.h); if (st.align) p.align = st.align; if (ids.length) p.ids = ids; if (st.big) p.size = st.big;
    // a whole paragraph in bold (or italic) is carried by its runs already
    out.push(p); ids = [];
  };
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)/g; let m: RegExpExecArray | null; let skip = 0;
  while ((m = re.exec(body))) {
    if (m[4] !== undefined) { if (skip) continue; let t = unent(m[4]); if (!pre) t = t.replace(/[\r\n\t ]+/g, " "); if (t) runs.push({ t, ...(cur.b ? { b: 1 } : {}), ...(cur.i ? { i: 1 } : {}), ...(cur.u ? { u: 1 } : {}), ...(cur.sup ? { sup: 1 } : {}) } as Run); continue; }
    if (!m[2]) continue; const tag = m[2].toLowerCase(); const raw = m[3] || ""; const close = m[1] === "/"; const selfClose = /\/\s*$/.test(raw) || ["br", "hr", "img", "meta", "link", "input", "image"].includes(tag);
    if (tag === "script" || tag === "style" || tag === "head" || tag === "svg") { skip += close ? -1 : selfClose ? 0 : 1; if (skip < 0) skip = 0; continue; }
    if (skip) continue;
    if (tag === "br") { runs.push({ t: "\n" }); continue; }
    if (tag === "hr") { flush(); out.push({ kind: "hr", runs: [] }); continue; }
    if (close) {
      if (BLOCK.has(tag)) flush(tag === "p" || /^h\d$/.test(tag));
      for (let k = stack.length - 1; k >= 0; k--) if (stack[k].tag === tag) { stack.length = k; break; }
      cur = stack.length ? stack[stack.length - 1].st : {}; if (tag === "pre") pre = Math.max(0, pre - 1);
      if (BLOCK.has(tag)) blockSt = cur; continue;
    }
    const id = attr(raw, "id") || (tag === "a" ? attr(raw, "name") : "");
    if (BLOCK.has(tag)) flush();
    if (id) ids.push(id);
    const st = styleOf(tag, raw, cur);
    if (!selfClose) { stack.push({ tag, st }); cur = st; if (tag === "pre") pre++; }
    if (BLOCK.has(tag)) blockSt = st;
  }
  flush();
  return out;
}

/** Lines of a verse arrive as separate short paragraphs with empty spacer paragraphs between the verses:
    join each group into one block with line breaks. Empty paragraphs are then dropped. */
export function groupVerses(ps: HtmlPara[]): HtmlPara[] {
  const out: HtmlPara[] = []; let i = 0;
  const lineLike = (p: HtmlPara) => p.kind === "p" && p.runs.length > 0 && plain(p.runs).length <= 110 && !/[.!?]["”’)]?$/.test(plain(p.runs).trim().replace(/\|\|?\s*[\d.\-–]*\s*\|*$/, "|"));
  const sameLook = (a: HtmlPara, b: HtmlPara) => a.align === b.align && !a.runs.every((r) => r.b) === !b.runs.every((r) => r.b) && !a.runs.every((r) => r.i) === !b.runs.every((r) => r.i);
  while (i < ps.length) {
    const p = ps[i];
    if (!p.runs.length && p.kind === "p") { if (p.ids?.length) { const nx = ps.slice(i + 1).find((x) => x.runs.length); if (nx) nx.ids = [...(p.ids || []), ...(nx.ids || [])]; } i++; continue; }
    if (lineLike(p)) {
      let j = i + 1; while (j < ps.length && lineLike(ps[j]) && sameLook(p, ps[j])) j++;
      const n = j - i; const verseMark = /\|\|?\s*[\d.\-–]*\s*\|*\s*$|॥/.test(plain(ps[j - 1].runs)) || /\|\s*$/.test(plain(p.runs));
      const bounded = (i === 0 || !ps[i - 1].runs.length || ps[i - 1].kind !== "p") && (j >= ps.length || !ps[j].runs.length || ps[j].kind !== "p");
      if (n >= 2 && n <= 12 && (verseMark || (bounded && (p.align === "center" || p.runs.every((r) => r.i))))) {
        const runs: Run[] = []; const ids: string[] = [];
        for (let k = i; k < j; k++) { if (k > i) runs.push({ t: "\n" }); runs.push(...ps[k].runs); if (ps[k].ids) ids.push(...ps[k].ids!); }
        out.push({ kind: "verse", align: p.align, runs: tidyRuns(runs), ids: ids.length ? ids : undefined }); i = j; continue;
      }
    }
    out.push(p); i++;
  }
  return out;
}
