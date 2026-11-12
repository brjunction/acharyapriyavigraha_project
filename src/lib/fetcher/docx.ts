/* Word (.docx) → the fetcher's book. Reads the document's own XML, so headings, bold, italic, underline,
   centre/right alignment and the font of every run (for Balaram letters) are all known exactly. */
import { unzipSync, strFromU8 } from "fflate";
import type { Chapter, Fetched, Note, Para, Run } from "./types";
import { plain, tidyRuns } from "./types";
import { balaramToIast, isBalaramFont, looksBalaram, tidyText } from "./balaram";
import { fromFileName } from "./epub";

const ent = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
const on = (xml: string, tag: string) => { const m = new RegExp(`<w:${tag}(?:\\s[^>]*)?/?>`).exec(xml); if (!m) return undefined; const v = /w:val="([^"]*)"/.exec(m[0])?.[1]; return !(v === "0" || v === "false" || v === "none"); };
type St = { b?: boolean; i?: boolean; u?: boolean; jc?: string; level?: number; font?: string; based?: string; size?: number };
const props = (xml: string): St => { const s: St = {}; const b = on(xml, "b"), i = on(xml, "i"), u = on(xml, "u"); if (b !== undefined) s.b = b; if (i !== undefined) s.i = i; if (u !== undefined) s.u = u;
  const jc = /<w:jc w:val="([^"]+)"/.exec(xml)?.[1]; if (jc) s.jc = jc; const ol = /<w:outlineLvl w:val="(\d+)"/.exec(xml)?.[1]; if (ol !== undefined && +ol < 9) s.level = +ol + 1;
  const f = /<w:rFonts[^>]*w:ascii="([^"]+)"/.exec(xml)?.[1]; if (f) s.font = f; const sz = /<w:sz w:val="(\d+)"/.exec(xml)?.[1]; if (sz) s.size = +sz / 2; return s; };

export function readDocx(bytes: Uint8Array, fileName: string): Fetched {
  const zip = unzipSync(bytes, { filter: (f) => /^word\/(document|styles)\.xml$|^docProps\/core\.xml$/.test(f.name) });
  const docXml = zip["word/document.xml"] ? strFromU8(zip["word/document.xml"]) : ""; if (!docXml) throw new Error("This does not look like a Word (.docx) file.");
  const styles = new Map<string, St>(); let defFont = "", defSize = 11;
  if (zip["word/styles.xml"]) { const sx = strFromU8(zip["word/styles.xml"]); const dd = /<w:docDefaults>[\s\S]*?<\/w:docDefaults>/.exec(sx)?.[0] || ""; const d = props(dd); defFont = d.font || ""; defSize = d.size || 11;
    for (const m of sx.matchAll(/<w:style\s[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g)) { const st = props(m[2]); st.based = /<w:basedOn w:val="([^"]+)"/.exec(m[2])?.[1]; const name = /<w:name w:val="([^"]+)"/.exec(m[2])?.[1] || m[1]; const h = /^(heading|überschrift|titre|rubrik)\s*(\d)/i.exec(name); if (h && !st.level) st.level = +h[2]; if (h && st.level) st.level = Math.min(4, +h[2] + 1); if (/^(title|book title)$/i.test(name)) st.level = 1; if (/^subtitle$/i.test(name) && !st.level) st.level = 2; styles.set(m[1], st); } }
  const resolve = (id?: string, depth = 0): St => { if (!id || depth > 8) return {}; const s = styles.get(id); if (!s) return {}; return { ...resolve(s.based, depth + 1), ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined)) }; };
  const normalId = [...styles.keys()].find((k) => /^normal$|^standard$/i.test(k)); const base = resolve(normalId); const bodySize = base.size || defSize;
  const body = /<w:body>([\s\S]*)<\/w:body>/.exec(docXml)?.[1] || docXml;
  type P = Para & { fonts: string[] }; const paras: P[] = []; const fontText: Record<string, string> = {};
  for (const pm of body.matchAll(/<w:p[ >][\s\S]*?<\/w:p>|<w:p\/>/g)) { const px = pm[0]; const ppr = /<w:pPr>([\s\S]*?)<\/w:pPr>/.exec(px)?.[1] || ""; const sid = /<w:pStyle w:val="([^"]+)"/.exec(ppr)?.[1];
    const ps = { ...base, ...resolve(sid), ...props(ppr.replace(/<w:rPr>[\s\S]*?<\/w:rPr>/g, "")) }; const runs: (Run & { f: string })[] = []; let maxSize = 0;
    for (const rm of px.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/, "").matchAll(/<w:r[ >][\s\S]*?<\/w:r>/g)) { const rx = rm[0]; if (/<w:footnoteReference|<w:endnoteReference/.test(rx)) continue; const rpr = /<w:rPr>([\s\S]*?)<\/w:rPr>/.exec(rx)?.[1] || ""; const rs = { ...ps, ...resolve(/<w:rStyle w:val="([^"]+)"/.exec(rpr)?.[1]), ...props(rpr) };
      let t = ""; for (const tm of rx.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:(br|cr|tab|noBreakHyphen|softHyphen)(?:\s[^>]*)?\/>|<w:sym[^>]*\/>/g)) { if (tm[1] !== undefined) t += ent(tm[1]); else if (tm[2] === "br" || tm[2] === "cr") t += /w:type="page"/.test(tm[0]) ? "" : "\n"; else if (tm[2] === "tab") t += " "; else if (tm[2] === "noBreakHyphen") t += "-"; }
      if (!t) continue; const f = rs.font || defFont || ""; fontText[f] = ((fontText[f] || "") + t).slice(0, 8000); if (t.trim()) maxSize = Math.max(maxSize, rs.size || bodySize);
      runs.push({ t, f, ...(rs.b ? { b: 1 as const } : {}), ...(rs.i ? { i: 1 as const } : {}), ...(rs.u ? { u: 1 as const } : {}), ...(/<w:vertAlign w:val="superscript"/.test(rpr) ? { sup: 1 as const } : {}) }); }
    const text = runs.map((r) => r.t).join(""); if (!text.trim()) { paras.push({ kind: "hr", runs: [], fonts: [] }); continue; }      // an empty line: a spacer (used to see stanzas)
    const p: P = { kind: "p", runs, fonts: [...new Set(runs.map((r) => r.f))] }; if (ps.jc === "center") p.align = "center"; else if (ps.jc === "right" || ps.jc === "end") p.align = "right";
    const allBold = runs.filter((r) => r.t.trim()).every((r) => r.b);
    if (ps.level) { p.kind = "h"; p.level = Math.min(4, ps.level); } else if (text.length < 120 && !text.includes("\n") && (maxSize >= bodySize * 1.25 || (allBold && p.align === "center" && !/[.,;]$/.test(text.trim())))) { p.kind = "h"; p.level = maxSize >= bodySize * 1.6 ? 1 : maxSize >= bodySize * 1.25 ? 2 : 3; }
    paras.push(p); }
  const notes: Note[] = [];
  // Balaram letters, font by font
  const all = Object.values(fontText).join(" "), docBal = looksBalaram(all); const conv = new Set<string>(); for (const [f, t] of Object.entries(fontText)) { const b = (t.match(/[äéüåñëçàùìïöò]/g) || []).length, u = (t.match(/[āīūṛṣṇśṁḥṭḍ]/g) || []).length; if (b && b >= u && (isBalaramFont(f) || looksBalaram(t) || docBal)) conv.add(f); }
  let n = 0; for (const p of paras) for (const r of p.runs as (Run & { f?: string })[]) { let t = tidyText(r.t); if (conv.has(r.f || "")) { const c = balaramToIast(t); if (c !== t) n++; t = c; } r.t = t; delete r.f; }
  if (conv.size) notes.push({ key: "balaram", text: `Old Balaram letters were changed to proper diacritics (Kåñëa → Kṛṣṇa) in the fonts ${[...conv].filter(Boolean).slice(0, 6).join(", ") || "of this file"}.`, count: n });
  // stanzas: several short lines between empty lines, or lines broken inside one paragraph
  const out: Para[] = []; let i = 0;
  while (i < paras.length) { const p = paras[i]; if (p.kind === "hr") { i++; continue; }
    if (p.kind === "p") { let j = i; const grp: P[] = []; while (j < paras.length && paras[j].kind === "p" && plain(paras[j].runs).length < 90 && !/[a-z],? [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+/.test(plain(paras[j].runs)) && paras[j].align === p.align) { grp.push(paras[j]); j++; }
      const stanza = grp.length >= 2 && grp.length <= 8 && (p.align === "center" || grp.every((g) => g.runs.filter((r) => r.t.trim()).every((r) => r.i))) && (j >= paras.length || paras[j].kind !== "p" || plain(paras[j].runs).length >= 90 || paras[j].align !== p.align);
      if (stanza) { const runs: Run[] = []; grp.forEach((g, k) => { if (k) runs.push({ t: "\n" }); runs.push(...g.runs); }); out.push({ kind: "verse", runs: tidyRuns(runs), ...(p.align ? { align: p.align } : {}) }); i = j; continue; } }
    const q: Para = { kind: p.kind === "p" && plain(p.runs).includes("\n") && plain(p.runs).length < 500 && (p.align === "center" || p.runs.filter((r) => r.t.trim()).every((r) => r.i)) ? "verse" : p.kind, runs: tidyRuns(p.runs) }; if (p.level) q.level = p.level; if (p.align) q.align = p.align; if (q.runs.length) out.push(q); i++; }
  // chapters at the headings
  const hs = out.filter((p) => p.kind === "h"); const top = hs.length ? Math.min(...hs.map((h) => h.level || 9)) : 0; const topN = hs.filter((h) => h.level === top).length;
  const cut = hs.length ? (topN >= 2 ? top : top + 1) : 0; const chapters: Chapter[] = []; let cur: Chapter | null = null; const front: Para[] = [];
  for (const p of out) { if (p.kind === "h" && cut && (p.level || 9) <= cut + 1 && (p.level || 9) >= (topN >= 2 ? top : top + 1)) { cur = { title: plain(p.runs).replace(/\n/g, " "), level: (p.level || cut) <= cut ? 1 : 2, paras: [] }; chapters.push(cur); continue; } (cur ? cur.paras : front).push(p); }
  if (front.length) chapters.unshift({ title: chapters.length ? "Opening" : "Text", level: 1, paras: front }); if (chapters.length && chapters[0].level > 1) chapters[0].level = 1;
  const core = zip["docProps/core.xml"] ? strFromU8(zip["docProps/core.xml"]) : ""; const [fnT, fnA] = fromFileName(fileName);
  const mt = ent(/<dc:title>([^<]*)</.exec(core)?.[1] || "").trim(); const h1 = topN === 1 ? plain(hs.find((h) => h.level === top)!.runs).replace(/\n/g, " ") : "";
  const title = h1 || (mt.length > 2 ? (conv.size ? balaramToIast(mt) : mt) : fnT) || "Untitled book";
  if (!hs.length) notes.push({ key: "no-chapters", text: "This Word file has no headings, so no chapters could be recognised. Use “Start a chapter here” on the lines where chapters begin." });
  const words = chapters.reduce((a, c) => a + c.paras.reduce((m, p) => m + plain(p.runs).split(/\s+/).length, 0), 0);
  notes.unshift({ key: "read", text: `Word file read: ${chapters.length} chapters, about ${words.toLocaleString()} words.` });
  return { title, author: /^unknown$/i.test(fnA) ? "" : fnA, language: "en", cover: null, chapters, notes, source: { name: fileName, kind: "docx" } };
}
