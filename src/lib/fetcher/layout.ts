/* Understanding a PDF's pages: which lines are running headers and page numbers, where paragraphs begin and end,
   what is a heading, what is a verse, what is centred — and where the chapters start. */
import type { Chapter, Fetched, Note, Para, Run } from "./types";
import { plain, tidyRuns } from "./types";
import type { Line, PdfRead } from "./pdf";
import { balaramToIast, isBalaramFont, looksBalaram, tidyText } from "./balaram";
import { fromFileName } from "./epub";

const textOf = (l: Line) => l.pieces.map((p) => p.t).join("");
const mode = (xs: number[], step = 1) => { const m = new Map<number, number>(); for (const x of xs) { const k = Math.round(x / step) * step; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0; };
const pct = (xs: number[], p: number) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * s.length)))]; };
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

export type LayoutOptions = { convertBalaram?: "auto" | "yes" | "no"; keepHeaders?: boolean; chapterPattern?: string; fileName?: string; magazine?: "auto" | "yes" | "no" };
const ISSUE = /^(?:issue\s+)?no\.?\s*(\d{1,4})\b[\s,·–—-]*(.{0,60}?\b(?:19|20)\d{2})?/i;

export function layoutPdf(read: PdfRead, opt: LayoutOptions = {}): Fetched {
  const notes: Note[] = []; let lines = read.lines.map((l) => ({ ...l, pieces: l.pieces.map((p) => ({ ...p })) })).filter((l) => textOf(l).trim());   // a copy: the same reading can be laid out again with other answers
  // 1 · Balaram letters → diacritics, font by font
  const sample: Record<string, string> = {}; for (const l of lines) for (const p of l.pieces) if ((sample[p.font] || "").length < 6000) sample[p.font] = (sample[p.font] || "") + p.t;
  const conv = new Set<string>(); const all = Object.values(sample).join(" "); const docBalaram = looksBalaram(all);
  const BAL = /[äéüåñëçàùìïöò]/g, IAST = /[āīūṛṣṇśṁḥṭḍ]/g;
  if (opt.convertBalaram !== "no") for (const f of Object.keys(sample)) { const b = (sample[f].match(BAL) || []).length, u = (sample[f].match(IAST) || []).length; if (!b || u > b) continue; if (opt.convertBalaram === "yes" || isBalaramFont(f) || looksBalaram(sample[f]) || docBalaram) conv.add(f); }
  let converted = 0;
  for (const l of lines) for (const p of l.pieces) { let t = tidyText(p.t); if (conv.has(p.font)) { const c = balaramToIast(t); if (c !== t) converted++; t = c; } p.t = t; }
  if (conv.size) notes.push({ key: "balaram", text: `Old Balaram letters were changed to proper diacritics (Kåñëa → Kṛṣṇa) in the fonts ${[...conv].slice(0, 6).join(", ")}.`, count: converted });
  const legacyDev = Object.keys(sample).filter((f) => /devanagari|^RM\b|sanskrit ?98|kruti|chanakya|shree|bengali-?normal/i.test(f)); if (legacyDev.length) { lines = lines.map((l) => ({ ...l, pieces: l.pieces.filter((p) => !legacyDev.includes(p.font)) })).filter((l) => textOf(l).trim()); notes.push({ key: "legacy-script", text: `Text set in old Devanāgarī or Bengali picture-fonts (${legacyDev.join(", ")}) cannot be read as letters and was left out. Add those verses by hand if they are needed.` }); }

  // 2 · body size and line pitch
  const bodySize = mode(lines.flatMap((l) => Array(Math.min(60, Math.ceil(textOf(l).length / 10))).fill(l.size)), 0.5) || 11;
  const byPage = new Map<number, Line[]>(); for (const l of lines) { if (!byPage.has(l.page)) byPage.set(l.page, []); byPage.get(l.page)!.push(l); }
  const pitches: number[] = []; for (const ls of byPage.values()) for (let i = 1; i < ls.length; i++) { const d = ls[i].top - ls[i - 1].top; if (d > 0 && d < bodySize * 2.2 && Math.abs(ls[i].size - bodySize) < 0.8 && ls[i].col === ls[i - 1].col) pitches.push(d); }
  const pitch = mode(pitches, 0.5) || bodySize * 1.25;

  // 3 · running headers, footers and page numbers
  const edge: Line[] = []; for (const ls of byPage.values()) { const s = [...ls].sort((a, b) => a.top - b.top); for (const l of [...s.slice(0, 2), ...s.slice(-2)]) if (l.top < l.H * 0.115 || l.top > l.H * 0.9) edge.push(l); }
  const keyOf = (l: Line) => norm(textOf(l)).replace(/\d+/g, "") + (l.top < l.H / 2 ? "^" : "$");
  const seen = new Map<string, number>(); for (const l of edge) seen.set(keyOf(l), (seen.get(keyOf(l)) || 0) + 1);
  const repeat = Math.max(3, Math.floor(byPage.size * 0.08)); const drop = new Set<Line>(); const removed = new Map<string, number>();
  if (!opt.keepHeaders) for (const l of edge) { const t = textOf(l).trim(); const num = /^[\-–—\s]*(\d{1,4}|[ivxlcdm]{1,7})[\-–—\s]*$/i.test(t) || /^(page\s+)?\d{1,4}(\s+of\s+\d+)?$/i.test(t);
    if (num || (seen.get(keyOf(l)) || 0) >= repeat || (l.size < bodySize * 0.72 && t.length < 90)) { drop.add(l); if (!num) { const k = t.replace(/\d+/g, "#").slice(0, 60); removed.set(k, (removed.get(k) || 0) + 1); } } }
  lines = lines.filter((l) => !drop.has(l));
  if (drop.size) notes.push({ key: "headers", text: `Running headers, footers and page numbers were removed${removed.size ? ` (for example “${[...removed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]).join("”, “")}”)` : ""}.`, count: drop.size });

  // 4 · the column each line sits in (per page and column): left edge, right edge
  type G = { left: number; right: number }; const geo = new Map<string, G>();
  const gk = (l: Line) => `${l.page}:${l.col ?? -1}`;
  { const groups = new Map<string, Line[]>(); for (const l of lines) { const k = gk(l); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(l); }
    // odd and even pages often have different margins; a page with little text borrows from pages of the same parity
    const par = new Map<string, { l: number[]; r: number[] }>();
    for (const [k, ls] of groups) { const full = ls.filter((l) => Math.abs(l.size - bodySize) < 1 && l.x1 - l.x0 > l.W * (l.col === undefined ? 0.5 : 0.25)); const pk = `${ls[0].page % 2}:${ls[0].col ?? -1}`; if (!par.has(pk)) par.set(pk, { l: [], r: [] }); if (full.length >= 4) { const g = { left: pct(full.map((l) => l.x0), 0.1), right: pct(full.map((l) => l.x1), 0.9) }; geo.set(k, g); par.get(pk)!.l.push(g.left); par.get(pk)!.r.push(g.right); } }
    for (const [k, ls] of groups) if (!geo.has(k)) { const pk = `${ls[0].page % 2}:${ls[0].col ?? -1}`; const p = par.get(pk); geo.set(k, p && p.l.length ? { left: mode(p.l, 1), right: mode(p.r, 1) } : { left: Math.min(...ls.map((l) => l.x0)), right: Math.max(...ls.map((l) => l.x1)) }); } }

  // 5 · what each line is
  type M = { l: Line; text: string; centered: boolean; indent: boolean; short: boolean; bold: boolean; italic: boolean; big: number; gapBefore: number; heading: number; rightAl: boolean };
  const ms: M[] = lines.map((l, i) => { const g = geo.get(gk(l))!; const w = Math.max(60, g.right - g.left); const text = textOf(l).trim(); const chars = l.pieces.reduce((n, p) => n + p.t.trim().length, 0) || 1;
    const bold = l.pieces.reduce((n, p) => n + (p.b ? p.t.trim().length : 0), 0) / chars > 0.85, italic = l.pieces.reduce((n, p) => n + (p.i ? p.t.trim().length : 0), 0) / chars > 0.85;
    const lm = l.x0 - g.left, rm = g.right - l.x1; const centered = lm > w * 0.05 && rm > w * 0.05 && Math.abs(lm - rm) < Math.max(8, w * 0.06);
    const prev = lines[i - 1]; const gapBefore = prev && prev.page === l.page && prev.col === l.col ? l.top - prev.top : 99;
    return { l, text, centered, indent: !centered && lm > l.size * 0.7 && lm < w * 0.22, short: rm > w * 0.1, rightAl: !centered && lm > w * 0.35 && rm < w * 0.03 && (text.length < 46 || /^[(—–-]|\)$/.test(text)), bold, italic, big: l.size / bodySize, gapBefore, heading: 0 }; });
  // headings: larger type; or a short bold / small-caps line standing alone
  const sizes = [...new Set(ms.filter((m) => m.big >= 1.16 && m.text.length < 140).map((m) => Math.round(m.l.size)))].sort((a, b) => b - a);
  for (let i = 0; i < ms.length; i++) { const m = ms[i]; if (/^[\d\s.\-–—*•]+$/.test(m.text)) continue;
    if (m.big >= 1.16 && m.text.length < 140 && /\p{L}{2}/u.test(m.text)) m.heading = Math.min(3, sizes.indexOf(Math.round(m.l.size)) + 1);
    else { const next = ms[i + 1]; const alone = m.gapBefore > pitch * 1.45 && (!next || next.l.page !== m.l.page || next.l.top - m.l.top > pitch * 1.2 || !next.bold);
      const caps = m.text.length > 3 && m.text === m.text.toUpperCase() && /[A-ZĀĪŪṚŚṢṆ]{3}/.test(m.text);
      if (m.text.length < 90 && alone && !/[.,;:]$/.test(m.text) && ((m.bold && (m.centered || m.short)) || (caps && m.centered && m.big >= 0.98))) m.heading = Math.min(4, sizes.length + 1); } }

  // 6 · paragraphs
  const paras: Para[] = []; let cur: { ms: M[]; kind: "p" | "h" | "verse" | "quote"; level?: number; align?: Para["align"] } | null = null; let dehyph = 0;
  const runsOf = (m: M): Run[] => m.l.pieces.map((p) => ({ t: p.t, ...(p.b && !m.heading ? { b: 1 as const } : {}), ...(p.i ? { i: 1 as const } : {}), ...(p.sup ? { sup: 1 as const } : {}) }));
  const close = () => { if (!cur) return; const c = cur; cur = null; let runs: Run[] = [];
    c.ms.forEach((m, k) => { const r = runsOf(m); if (k === 0) { runs = r; return; }
      if (c.kind === "verse") { runs.push({ t: "\n" }, ...r); return; }
      const last = runs[runs.length - 1]; const prevText = plain(runs);
      if (/[A-Za-zāīūṛṣṇśṁḥ]-$/.test(prevText.trimEnd()) && /^[a-zāīūṛṣṇśṁḥ]/.test(m.text)) { // a word broken at the line's end
        const before = /([A-Za-zāīūṛṣṇśṁḥ]+)-$/.exec(prevText.trimEnd())?.[1] || ""; const keep = !!last?.i || /[āīūṛṣṇśṁḥ]/.test(before + m.text.split(/\s/)[0]);
        last.t = last.t.trimEnd(); if (!keep) { last.t = last.t.replace(/-$/, ""); dehyph++; } runs.push(...r); }
      else { if (last && !/\s$/.test(last.t)) runs.push({ t: " " }); runs.push(...r); } });
    const tidy = tidyRuns(runs); if (!plain(tidy).trim()) return;
    const whole = (k: "b" | "i") => tidy.filter((r) => r.t.trim()).every((r) => r[k]);
    const p: Para = { kind: c.kind, runs: tidy, page: c.ms[0].l.page }; if (c.level) p.level = c.level; if (c.align) p.align = c.align;
    if (c.kind === "h") { const t = plain(tidy); if (/^[“"‘]/.test(t) || t.length > 150 || (/[.!?]["”’]?$/.test(t) && t.split(/\s+/).length > 9)) { p.kind = "quote"; delete p.level; } }
    // a centred block of several lines, or of italic words, is a verse
    if (c.kind === "p" && c.align === "center" && c.ms.length === 1 && whole("i") && plain(tidy).length < 120) p.kind = "verse";
    paras.push(p); };
  for (let i = 0; i < ms.length; i++) { const m = ms[i]; const prev = cur ? cur.ms[cur.ms.length - 1] : null;
    const samePlace = prev && prev.l.page === m.l.page && prev.l.col === m.l.col; const gap = samePlace ? m.l.top - prev!.l.top : 0; const far = samePlace && gap > Math.max(pitch, prev!.l.size * 1.15) * 1.42;
    if (m.heading) { if (cur && cur.kind === "h" && cur.level === m.heading && samePlace && !far && plain(cur.ms.flatMap(runsOf)).length < 420) { cur.ms.push(m); continue; } close(); cur = { ms: [m], kind: "h", level: m.heading, ...(m.centered ? { align: "center" as const } : {}) }; continue; }
    if (m.centered) { if (cur && cur.kind === "verse" && samePlace && !far) { cur.ms.push(m); continue; } close();
      const next = ms[i + 1]; const more = next && next.centered && !next.heading && next.l.page === m.l.page && next.l.col === m.l.col && next.l.top - m.l.top < Math.max(pitch, m.l.size * 1.15) * 1.42;
      cur = { ms: [m], kind: more ? "verse" : "p", align: "center" }; if (!more) close(); continue; }
    // the previous line ended its paragraph if this line's first word would still have fitted on it
    const fw = (() => { const w = m.text.split(/\s/)[0].length; return (w + 1) * ((m.l.x1 - m.l.x0) / Math.max(1, m.text.length)); })();
    const ended = prev ? (geo.get(gk(prev.l))!.right - prev.l.x1) > fw + prev.l.size * 0.4 : false;
    const stepIn = prev && samePlace ? m.l.x0 - prev.l.x0 > m.l.size * 0.7 && m.l.x0 - prev.l.x0 < 60 && cur!.ms.length > 1 || (cur!.ms.length === 1 && m.l.x0 - prev.l.x0 > m.l.size * 0.7 && prev.indent) : m.indent;
    const cont = cur && cur.kind === "p" && !cur.align && prev && !ended && !stepIn && !far && Math.abs(prev.l.size - m.l.size) < 1.2
      && (samePlace || (!/[.!?:”"’)]$/.test(prev.text) || /^[a-zāīūṛṣṇśṁḥ]/.test(m.text)));
    // hanging lines of a verse set flush left: short italic lines one under another
    if (cur && cur.kind === "verse" && samePlace && !far && m.italic && m.text.length < 80 && (m.short || m.indent)) { cur.ms.push(m); continue; }
    if (cont) { cur!.ms.push(m); continue; }
    close();
    const next = ms[i + 1]; const stanza = m.italic && m.short && next && next.italic && next.short && !next.centered && !next.heading && next.l.page === m.l.page && next.l.top - m.l.top < pitch * 1.42 && m.text.length < 80;
    cur = { ms: [m], kind: stanza ? "verse" : "p", ...(m.rightAl ? { align: "right" as const } : {}) }; }
  close();
  if (dehyph) notes.push({ key: "hyphens", text: "Words broken at the end of a line were joined again (Sanskrit compounds keep their hyphen).", count: dehyph });

  for (let i = paras.length - 1; i >= 0; i--) if (/^\(?continued (on|from) (page|pg\.?) ?\d+\)?\.?$/i.test(plain(paras[i].runs).trim())) paras.splice(i, 1);
  // 7 · a printed "Contents" page repeats what the chapters already say
  let tocDropped = 0; const isTocLine = (p: Para) => /(\.{3,}|…{2,}|\s{2,}|\t)\s*\d{1,4}$/.test(plain(p.runs)) || /^.{3,80}\s\d{1,4}$/.test(plain(p.runs)) && plain(p.runs).length < 90;
  const byPg = new Map<number, Para[]>(); for (const p of paras) { if (!byPg.has(p.page || 0)) byPg.set(p.page || 0, []); byPg.get(p.page || 0)!.push(p); }
  const tocPages = new Set<number>(); for (const [pg, ps] of byPg) { if (pg > Math.max(12, read.pages * 0.12)) continue; const n = ps.filter(isTocLine).length; if (n >= 5 && n / ps.length > 0.5) tocPages.add(pg); }
  const printedToc: string[] = []; const body = paras.filter((p) => { if (tocPages.has(p.page || 0)) { tocDropped++; const t = plain(p.runs).replace(/[.…\s]*\d{1,4}$/, "").trim(); if (t.length > 2 && !/^(table of )?contents$/i.test(t)) printedToc.push(t); return false; } return true; });
  if (tocDropped) notes.push({ key: "printed-toc", text: "The printed “Contents” page was used to find the chapters and then left out of the text (the website shows its own contents).", count: tocDropped });

  // 8 · chapters: the PDF's own bookmarks, else a chapter pattern, else the printed contents, else the largest headings
  const chapters: Chapter[] = []; const starts: { at: number; title: string; level: number }[] = [];
  const fixT = (s: string) => { const t = tidyText(s).replace(/\s+/g, " ").trim(); return conv.size && /[äéüåñëçàùìïöò]/.test(t) && !/[āīūṛṣṇśṁḥ]/.test(t) ? balaramToIast(t) : t; };
  const outline = read.outline.filter((o) => o.page > 0).map((o) => ({ ...o, title: fixT(o.title) }));
  const findOn = (title: string, from: number, pageFrom: number, pageTo: number) => { const k = norm(title); if (k.length < 3) return -1; for (let i = from; i < body.length; i++) { const pg = body[i].page || 0; if (pg < pageFrom) continue; if (pg > pageTo) break; const t = norm(plain(body[i].runs)); if (t && (t.startsWith(k.slice(0, 24)) || (k.startsWith(t) && t.length > 5)) && plain(body[i].runs).length < 160) return i; } return -1; };
  if (opt.chapterPattern) { let re: RegExp | null = null; try { re = new RegExp(opt.chapterPattern, "i"); } catch {} if (re) body.forEach((p, i) => { const t = plain(p.runs); if (t.length < 200 && re!.test(t)) starts.push({ at: i, title: t.replace(/\n/g, " ").slice(0, 140), level: 1 }); }); if (starts.length) notes.push({ key: "pattern", text: `Chapters were started at every line matching “${opt.chapterPattern}”.`, count: starts.length }); }
  if (!starts.length && outline.length >= 2) { let from = 0; const minL = Math.min(...outline.map((o) => o.level));
    for (const o of outline) { let at = findOn(o.title, from, o.page, o.page + 1); if (at < 0) at = body.findIndex((p, i) => i >= from && (p.page || 0) >= o.page); if (at < 0) continue; if (starts.length && starts[starts.length - 1].at === at) { if (norm(o.title) !== norm(starts[starts.length - 1].title)) starts[starts.length - 1].title += " " + o.title; continue; } starts.push({ at, title: o.title, level: Math.min(4, o.level - minL + 1) }); from = at; }
    notes.push({ key: "bookmarks", text: "The chapters follow the PDF’s own bookmarks.", count: starts.length }); }
  if (!starts.length && printedToc.length >= 3) { let from = 0; for (const t of printedToc) { const at = findOn(t, from, 0, 1e9); if (at >= 0 && (body[at].kind === "h" || plain(body[at].runs).length < 100)) { starts.push({ at, title: plain(body[at].runs).replace(/\n/g, " "), level: 1 }); from = at + 1; } } if (starts.length >= Math.max(2, printedToc.length * 0.5)) notes.push({ key: "from-contents", text: "The chapters follow the printed “Contents” page.", count: starts.length }); else starts.length = 0; }
  // a magazine: every issue begins with "Issue No. 12, 3 May 2004"; its articles are the headings inside
  const issueAt = body.map((p, i) => ({ i, m: plain(p.runs).length < 160 ? ISSUE.exec(plain(p.runs).trim()) : null })).filter((x) => x.m);
  const magazine = !starts.length && opt.magazine !== "no" && (opt.magazine === "yes" ? issueAt.length >= 1 : issueAt.length >= 3);
  let single = "";
  if (magazine) { const skip = new Set<number>(); const many = issueAt.length > 1;
    issueAt.forEach((x, k) => { const pg = body[x.i].page; let a = x.i; while (a > 0 && body[a - 1].page === pg && x.i - a < 6) a--;        // the masthead above the issue line
      for (let j = a; j < x.i; j++) skip.add(j); const label = `Issue ${x.m![1]}${x.m![2] ? ` · ${x.m![2].trim()}` : ""}`; if (many) starts.push({ at: x.i, title: label, level: 1 }); else single = label; skip.add(x.i);
      const end = k + 1 < issueAt.length ? issueAt[k + 1].i : body.length; let seenText = false;
      for (let j = x.i + 1; j < end; j++) { const p = body[j], t = plain(p.runs).trim();
        if (!seenText && p.page === pg && (/^contents:?/i.test(t) || /^[•·]/.test(t) || /^[·•\s]+$/.test(t))) { skip.add(j); continue; }  // the little contents box of the first page
        if (/^[·•\s]+$/.test(t)) { skip.add(j); continue; }
        if (/page\s*[—–-]+\s*\d+/i.test(t) && t.length < 60 || /^(sri krishna[- ]kath+amrt+a|.{0,40}\bbi+ndu)$/i.test(t)) { skip.add(j); continue; }      // the masthead and running heads
        if (p.kind === "h" && t.length > 2) starts.push({ at: j, title: t.replace(/\n/g, " ").replace(/^[•·\s]+/, ""), level: many ? 2 : 1 }); else if (t.length > 200) seenText = true; } });
    starts.sort((p, q) => p.at - q.at); for (let k = starts.length - 1; k >= 0; k--) if (skip.has(starts[k].at) && !issueAt.some((x) => x.i === starts[k].at)) starts.splice(k, 1);
    for (let k = starts.length - 2; k >= 0; k--) { const a = starts[k], b = starts[k + 1]; if (a.level === b.level && a.level === (many ? 2 : 1)) { let empty = true; for (let j = a.at + 1; j < b.at; j++) if (!skip.has(j) && plain(body[j].runs).trim()) { empty = false; break; } if (empty && (a.title + b.title).length < 150) { a.title = `${a.title} ${b.title}`; for (let j = a.at + 1; j <= b.at; j++) skip.add(j); starts.splice(k + 1, 1); } } }
    for (const j of skip) body[j] = { kind: "p", runs: [] };
    notes.push({ key: "magazine", text: many ? `This looks like a magazine: ${issueAt.length} issues were found, each with its articles.` : "This looks like one issue of a magazine: its articles became the chapters.", count: starts.length }); }
  if (!starts.length) { const hs = body.map((p, i) => ({ p, i })).filter((x) => x.p.kind === "h"); const after = Math.max(2, Math.floor(read.pages * 0.04));
    const lv = [1, 2, 3, 4].find((l) => hs.filter((h) => (h.p.level || 9) <= l && (h.p.page || 0) > after).length >= 2) || [1, 2, 3, 4].find((l) => hs.filter((h) => (h.p.level || 9) <= l).length >= 2);
    if (lv) { const main = hs.filter((h) => (h.p.level || 9) <= lv), sub = hs.filter((h) => (h.p.level || 9) === lv + 1); const withSub = sub.length > 0 && sub.length <= main.length * 6 + 10;
      for (const h of hs) { const L = h.p.level || 9; if (L <= lv) starts.push({ at: h.i, title: plain(h.p.runs).replace(/\n/g, " "), level: 1 }); else if (withSub && L === lv + 1) starts.push({ at: h.i, title: plain(h.p.runs).replace(/\n/g, " "), level: 2 }); }
      if (starts.length && starts[0].level > 1) starts[0].level = 1;
      notes.push({ key: "from-headings", text: "This PDF has no bookmarks, so the chapters were taken from its headings. Please check the contents list.", count: starts.length }); } }
  const strip = (ps: Para[], title: string) => { let k = 0; let acc = ""; while (k < ps.length && k < 3 && ps[k].kind === "h") { acc += plain(ps[k].runs); k++; if (norm(acc) === norm(title) || norm(title).startsWith(norm(acc))) continue; k--; break; } return ps.slice(Math.max(0, norm(acc) && norm(title).startsWith(norm(plain(ps[0]?.runs || []))) ? k : 0)); };
  if (!starts.length) { chapters.push({ title: "Text", level: 1, paras: body }); notes.push({ key: "no-chapters", text: "No chapters could be recognised. Use “Start a chapter here” on the lines where chapters begin." }); }
  else { if (starts[0].at > 0) chapters.push({ title: "Opening", level: 1, paras: body.slice(0, starts[0].at), page: body[0]?.page }); starts.forEach((s, k) => chapters.push({ title: s.title, level: s.level, paras: strip(body.slice(s.at, k + 1 < starts.length ? starts[k + 1].at : body.length), s.title).filter((p) => p.runs.length), page: body[s.at]?.page })); }
  for (const c of chapters) c.paras = c.paras.filter((p) => p.runs.length); if (chapters[0]?.title === "Opening" && !chapters[0].paras.length) chapters.shift();

  // 9 · title and author
  const [fnT, fnA] = fromFileName(opt.fileName || "book.pdf");
  const first = paras.filter((p) => (p.page || 0) <= 3 && p.kind === "h").sort((a, b) => (a.level || 9) - (b.level || 9))[0];
  const metaT = fixT(read.meta.title || ""); const sane = (s: string) => s.length > 2 && !/untitled|\.indd|\.doc|\.qxd|microsoft word|downloader|^unknown$/i.test(s);
  const title = single && sane(metaT || fnT) ? `${sane(metaT) ? metaT : fnT} · ${single}` : sane(metaT) ? metaT : first ? plain(first.runs).replace(/\n/g, " ") : sane(fnT) ? fnT : "Untitled book";
  const author = sane(fixT(read.meta.author || "")) ? fixT(read.meta.author || "") : /^unknown$/i.test(fnA) ? "" : fnA;
  const words = chapters.reduce((n, c) => n + c.paras.reduce((m, p) => m + plain(p.runs).split(/\s+/).length, 0), 0);
  const pagesWithText = new Set<number>(); { const per = new Map<number, number>(); for (const p of paras) per.set(p.page || 0, (per.get(p.page || 0) || 0) + plain(p.runs).length); for (const [pg, n] of per) if (n > 150) pagesWithText.add(pg); }
  const scan = read.pages > 0 && pagesWithText.size < read.pages * 0.5;
  if (scan) notes.unshift({ key: "scan", text: pagesWithText.size ? `Only ${pagesWithText.size} of ${read.pages} pages carry real text; the rest are pictures of pages. Use “Read the pages with AI” to read the whole book.` : "This PDF is made of pictures of pages (a scan): it has no text inside. Use “Read the pages with AI” to read it." });
  notes.unshift({ key: "read", text: `${read.pages} pages read: ${chapters.length} chapters, about ${words.toLocaleString()} words.` });
  return { title, author, language: "en", cover: null, chapters, notes, source: { name: opt.fileName || "book.pdf", kind: scan ? "pdf-scan" : "pdf", pages: read.pages } };
}
