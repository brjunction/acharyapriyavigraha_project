/* EPUB → book. Reads the e-book's own table of contents (toc.ncx or the EPUB 3 nav), its reading order and its
   stylesheet, so headings, bold, italic and centred text arrive as they were. Works for Calibre-made e-books
   (the Gauḍīya Grantha Mandira collection) and ordinary publisher e-books. */
import { unzipSync, strFromU8 } from "fflate";
import type { Chapter, Fetched, Note } from "./types";
import { plain } from "./types";
import { htmlToParas, groupVerses, parseCss, type HtmlPara, type Css } from "./html";
import { balaramToIast, looksBalaram, tidyText } from "./balaram";

const dir = (p: string) => (p.includes("/") ? p.slice(0, p.lastIndexOf("/") + 1) : "");
const join = (base: string, rel: string) => { const parts = (base + rel).split("/"); const out: string[] = []; for (const p of parts) { if (p === "..") out.pop(); else if (p !== ".") out.push(p); } return out.join("/"); };
const un = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&#x([0-9a-f]+);/gi, (_, d) => String.fromCodePoint(parseInt(d, 16)));
const tagText = (xml: string, tag: string) => { const m = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, "i").exec(xml); return m ? un(m[1].replace(/<[^>]+>/g, "")).trim() : ""; };
const at = (tag: string, name: string) => { const m = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag); return m ? un(m[1]) : ""; };
const fix = (s: string) => { const t = tidyText(s).replace(/\s+/g, " ").trim(); return looksBalaram(t + " " + t + " " + t) || /[äéüåñëçàù]/.test(t) && !/[āīūṛṣṇśṁḥ]/.test(t) ? balaramToIast(t) : t; };
/** "tattva-sutra_-_bhaktivinoda_thakura.epub" → ["Tattva-sutra", "Bhaktivinoda Thakura"] */
export function fromFileName(name: string): [string, string] {
  const base = name.replace(/\.[a-z0-9]+$/i, "").replace(/^Unknown\s*-\s*/i, "");
  const parts = base.split(/_-_|\s+-\s+|_\._/).map((p) => p.replace(/_/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
  const cap = (s: string) => s.replace(/(^|[\s(])([a-zāīūṛśṣ])/g, (m, a, b) => a + b.toUpperCase());
  return [cap(parts[0] || base), parts[1] && !/^commentary/i.test(parts[1]) ? cap(parts[1]) : ""];
}
type Toc = { title: string; file: string; anchor: string; depth: number };

export function readEpub(bytes: Uint8Array, fileName = "book.epub"): Fetched {
  const zip = unzipSync(bytes); const text = (p: string) => (zip[p] ? strFromU8(zip[p]) : "");
  const notes: Note[] = [];
  const opfPath = at(/<rootfile\b[^>]*>/i.exec(text("META-INF/container.xml"))?.[0] || "", "full-path") || Object.keys(zip).find((k) => k.endsWith(".opf")) || "";
  const opf = text(opfPath); if (!opf) throw new Error("This file is not a readable e-book (no content list inside).");
  const base = dir(opfPath);
  const items = new Map<string, { href: string; type: string; props: string }>();
  for (const m of opf.matchAll(/<item\b[^>]*>/gi)) items.set(at(m[0], "id"), { href: join(base, decodeURIComponent(at(m[0], "href"))), type: at(m[0], "media-type"), props: at(m[0], "properties") });
  const spine = [...opf.matchAll(/<itemref\b[^>]*>/gi)].map((m) => items.get(at(m[0], "idref"))?.href).filter((x): x is string => !!x && !!zip[x]);
  // stylesheet(s)
  const css: Css = {}; for (const it of items.values()) if (it.type.includes("css") || it.href.endsWith(".css")) Object.assign(css, parseCss(text(it.href)));
  // cover
  const coverId = at(/<meta\b[^>]*name="cover"[^>]*>/i.exec(opf)?.[0] || "", "content");
  const coverItem = items.get(coverId) || [...items.values()].find((i) => i.props.includes("cover-image")) || [...items.values()].find((i) => i.type.startsWith("image/") && /cover/i.test(i.href));
  const cover = coverItem && zip[coverItem.href] ? { bytes: zip[coverItem.href], type: coverItem.type || "image/jpeg" } : null;
  // table of contents: toc.ncx, else the EPUB 3 nav document
  const toc: Toc[] = [];
  const ncxItem = [...items.values()].find((i) => i.type.includes("ncx") || i.href.endsWith(".ncx"));
  if (ncxItem) {
    const ncx = text(ncxItem.href); const b = dir(ncxItem.href); let depth = 0;
    for (const m of ncx.matchAll(/<navPoint\b|<\/navPoint>|<text>([\s\S]*?)<\/text>|<content\b[^>]*>/gi)) {
      const s = m[0]; if (/^<navPoint/i.test(s)) { depth++; toc.push({ title: "", file: "", anchor: "", depth }); } else if (/^<\/navPoint/i.test(s)) depth--;
      else if (depth > 0 && toc.length) { const cur = toc[toc.length - 1]; if (m[1] !== undefined) { if (!cur.title) cur.title = un(m[1].replace(/<[^>]+>/g, "")); } else if (!cur.file) { const [f, a] = at(s, "src").split("#"); cur.file = join(b, decodeURIComponent(f)); cur.anchor = a || ""; } }
    }
  } else {
    const navItem = [...items.values()].find((i) => i.props.includes("nav")); const nav = navItem ? text(navItem.href) : ""; const b = navItem ? dir(navItem.href) : "";
    const part = /<nav\b[^>]*epub:type="toc"[\s\S]*?<\/nav>/i.exec(nav)?.[0] || nav; let depth = 0;
    for (const m of part.matchAll(/<ol\b|<\/ol>|<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) { if (/^<ol/i.test(m[0])) depth++; else if (/^<\/ol/i.test(m[0])) depth--; else { const [f, a] = un(m[1]).split("#"); toc.push({ title: un(m[2].replace(/<[^>]+>/g, "")), file: join(b, decodeURIComponent(f)), anchor: a || "", depth: Math.max(1, depth) }); } }
  }
  for (const t of toc) t.title = fix(t.title);
  // every document of the reading order, as paragraphs that remember their file
  type P = HtmlPara & { file: string; first?: 1 };
  const all: P[] = [];
  for (const f of spine) {
    const html = text(f); if (/calibre:cover|<svg[\s\S]*<image/i.test(html) && html.length < 3000) continue;
    const ps = groupVerses(htmlToParas(html, css)); ps.forEach((p, k) => all.push({ ...p, file: f, ...(k === 0 ? { first: 1 as const } : {}) }));
  }
  if (!all.length) throw new Error("No text was found inside this e-book.");
  // where each entry of the table of contents begins
  const startOf = (t: Toc) => { let k = t.anchor ? all.findIndex((p) => p.file === t.file && p.ids?.includes(t.anchor)) : -1; if (k < 0) k = all.findIndex((p) => p.file === t.file); return k; };
  let marks = toc.map((t) => ({ ...t, at: startOf(t) })).filter((t) => t.at >= 0 && t.title);
  marks = marks.filter((t, i) => i === 0 || t.at > marks[i - 1].at || t.depth !== marks[i - 1].depth).sort((a, b) => a.at - b.at || a.depth - b.depth);
  // no table of contents: the headings themselves
  if (marks.length < 2) { const hs = all.map((p, k) => ({ p, k })).filter((x) => x.p.kind === "h"); const top = Math.min(...hs.map((x) => x.p.level || 2)); if (hs.length >= 2) { marks = hs.map((x) => ({ title: plain(x.p.runs), file: x.p.file, anchor: "", depth: (x.p.level || 2) - top + 1, at: x.k })); notes.push({ key: "toc-from-headings", text: "This e-book has no table of contents of its own, so its headings were used." }); } }
  const [fnTitle, fnAuthor] = fromFileName(fileName);
  let title = fix(tagText(opf, "title")); let author = fix(tagText(opf, "creator"));
  // one single top entry holding everything = the book's own title
  const tops = marks.filter((m) => m.depth === 1);
  if (tops.length === 1 && marks.length > 1 && marks[0].depth === 1) { title = marks[0].title; const first = marks[0]; marks = marks.slice(1).map((m) => ({ ...m, depth: m.depth - 1 })); if (marks[0].at > first.at) marks.unshift({ ...first, title: "Opening", depth: 1 }); }
  if (!title || /^unknown$/i.test(title)) title = fnTitle;
  if (!author || /^(unknown|calibre|mycompany)$/i.test(author) || (fnAuthor && author !== fnAuthor && /brzezinski|jagat|grantha/i.test(author))) author = fnAuthor || author;
  const same = (a: string, b: string) => a.replace(/[\s\W]+/g, "").toLowerCase() === b.replace(/[\s\W]+/g, "").toLowerCase();
  const chapters: Chapter[] = [];
  const cut = (from: number, to: number, t: string, level: number) => {
    let ps = all.slice(from, to).filter((p) => p.runs.length || p.kind === "hr");
    while (ps.length && ps[0].kind === "h" && (same(plain(ps[0].runs), t) || same(plain(ps[0].runs), title))) ps = ps.slice(1);
    chapters.push({ title: t, level, paras: ps.map(({ kind, level: l, align, runs }) => ({ kind, ...(l ? { level: l } : {}), ...(align ? { align } : {}), runs })) });
  };
  if (!marks.length) cut(0, all.length, title, 1);
  else { if (marks[0].at > 0 && all.slice(0, marks[0].at).some((p) => p.runs.length && !(p.kind === "h" && same(plain(p.runs), title)))) cut(0, marks[0].at, "Opening", 1); marks.forEach((m, i) => cut(m.at, i + 1 < marks.length ? marks[i + 1].at : all.length, m.title, Math.min(4, m.depth))); }
  // an "Opening" with nothing in it is not a chapter
  const kept = chapters.filter((c, i) => c.paras.length || (i + 1 < chapters.length && chapters[i + 1].level > c.level));
  const words = kept.reduce((n, c) => n + c.paras.reduce((m, p) => m + plain(p.runs).split(/\s+/).length, 0), 0);
  notes.push({ key: "read", text: `${kept.length} chapters and about ${words.toLocaleString()} words were read from the e-book's own table of contents.` });
  return { title, author, language: tagText(opf, "language") || "sa", cover, chapters: kept, notes, source: { name: fileName, kind: "epub" } };
}
