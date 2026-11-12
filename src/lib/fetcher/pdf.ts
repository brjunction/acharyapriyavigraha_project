/* PDF → lines of text with their typography (size, bold, italic, position), page by page, using pdf.js.
   Works in the browser (the Studio) and in tests. The layout is understood afterwards, in layout.ts. */
export type Piece = { t: string; x: number; w: number; z: number; font: string; b?: 1; i?: 1; sup?: 1 };
export type Line = { page: number; top: number; x0: number; x1: number; size: number; pieces: Piece[]; W: number; H: number; col?: number };
export type Outline = { title: string; page: number; level: number };
export type PdfRead = { lines: Line[]; pages: number; outline: Outline[]; meta: { title?: string; author?: string }; textPages: number; fonts: Record<string, number> };

const clean = (n: string) => { let s = n; try { s = decodeURIComponent(n.replace(/#/g, "%")); } catch {} return s.replace(/^[A-Z]{6}\+/, ""); };

/** One page → its lines, top to bottom. Two-column pages are read column by column. */
export async function pageLines(page: any, pageNo: number): Promise<Line[]> {
  const [x0v, y0v, x1v, y1v] = page.view || [0, 0, 612, 792]; const W = x1v - x0v, H = y1v - y0v;
  try { await page.getOperatorList(); } catch {}
  const c = await page.getTextContent({ includeMarkedContent: false, disableNormalization: false });
  const names = new Map<string, string>(); const nameOf = (f: string) => { let v = names.get(f); if (v === undefined) { v = ""; try { v = clean(page.commonObjs.get(f)?.name || ""); } catch {} if (!v) v = clean(c.styles?.[f]?.fontFamily || f); names.set(f, v); } return v; };
  type Raw = Piece & { top: number };
  const raws: Raw[] = []; const seen = new Set<string>();
  for (const it of c.items as any[]) {
    if (!it.str || !it.transform) continue; const [a, b, , d, e, f] = it.transform; if (Math.abs(b) > Math.abs(a) * 0.3) continue; // rotated text (spine, watermark)
    const x = e - x0v, top = H - (f - y0v), z = Math.abs(d) || it.height || 10; if (x < -5 || x > W + 5 || top < -5 || top > H + 5) continue;
    const key = `${it.str}|${Math.round(x)}|${Math.round(top)}`; if (it.str.trim().length > 1 && seen.has(key)) continue; seen.add(key); // an overprinted copy
    const font = nameOf(it.fontName); const p: Raw = { t: it.str, x, w: it.width || 0, z, font, top };
    if (/bold|black|heavy|semibold|demi/i.test(font)) p.b = 1; if (/italic|oblique|-it\b|ital/i.test(font)) p.i = 1;
    raws.push(p);
  }
  if (!raws.length) return [];
  // rows: pieces that share a baseline
  raws.sort((p, q) => p.top - q.top || p.x - q.x);
  const rows: { top: number; ps: Raw[] }[] = [];
  for (const p of raws) { const r = rows.length ? rows[rows.length - 1] : null; if (r && Math.abs(r.top - p.top) < Math.max(1.8, Math.min(p.z, r.ps[0].z) * 0.32)) r.ps.push(p); else rows.push({ top: p.top, ps: [p] }); }
  // a second column? — an empty vertical band near the middle that most rows respect
  let gutter = 0;
  { const body = rows.filter((r) => r.ps.reduce((n, p) => n + p.t.trim().length, 0) > 25); if (body.length >= 12) { let best = 0;
      for (let gx = W * 0.36; gx <= W * 0.64; gx += 3) { let both = 0, clear = 0; for (const r of body) { const l = r.ps.some((p) => p.x + p.w < gx - 2 && p.t.trim()), rt = r.ps.some((p) => p.x > gx + 2 && p.t.trim()); const cross = r.ps.some((p) => p.x < gx - 3 && p.x + p.w > gx + 3 && p.t.trim()); if (!cross) clear++; if (l && rt && !cross) both++; } if (clear / body.length > 0.86 && both / body.length > 0.5 && both > best) { best = both; gutter = gx; } } } }
  const mk = (ps: Raw[], top: number, col?: number): Line | null => {
    ps = ps.filter((p) => p.t.length).sort((p, q) => p.x - q.x); if (!ps.some((p) => p.t.trim())) return null;
    const cnt = new Map<number, number>(); for (const p of ps) { const k = Math.round(p.z * 2) / 2; cnt.set(k, (cnt.get(k) || 0) + p.t.trim().length); }
    const size = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const out: Piece[] = [];
    let covered = -1e9, lastStart = -1e9;
    for (const p of ps) { if (p.t.trim()) { const tol = Math.max(1.5, p.z * 0.25);
        if (p.x < covered - tol && p.x + p.w <= covered + p.z * 0.3) continue;                      // a copy printed over what is already there
        if (p.x < covered - tol && Math.abs(p.x - lastStart) < tol && out.length) { while (out.length && out[out.length - 1].x >= lastStart - 0.01) out.pop(); } // a longer copy of the same words: it replaces the shorter
        else if (p.x < covered - tol) continue;
        lastStart = p.x; covered = Math.max(covered, p.x + p.w); }
      const prev = out[out.length - 1]; const q: Piece = { t: p.t, x: p.x, w: p.w, z: p.z, font: p.font, ...(p.b ? { b: 1 as const } : {}), ...(p.i ? { i: 1 as const } : {}) };
      if (p.z < size * 0.78 && p.top < top - size * 0.12 && p.t.trim().length <= 4) q.sup = 1;
      if (prev && !/\s$/.test(prev.t) && !/^\s/.test(q.t) && p.x - (prev.x + prev.w) > Math.max(1.2, size * 0.17)) out.push({ t: " ", x: prev.x + prev.w, w: 0, z: size, font: prev.font });
      out.push(q); }
    const vis = ps.filter((p) => p.t.trim()); return { page: pageNo, top, x0: vis[0].x, x1: Math.max(...vis.map((p) => p.x + p.w)), size, pieces: out, W, H, ...(col !== undefined ? { col } : {}) };
  };
  const lines: Line[] = [];
  if (!gutter) { for (const r of rows) { const l = mk(r.ps, r.top); if (l) lines.push(l); } return lines; }
  let left: Line[] = [], right: Line[] = []; const flush = () => { lines.push(...left, ...right); left = []; right = []; };
  for (const r of rows) {
    const cross = r.ps.some((p) => p.x < gutter - 3 && p.x + p.w > gutter + 3 && p.t.trim());
    if (cross) { flush(); const l = mk(r.ps, r.top); if (l) lines.push(l); continue; }
    const a = mk(r.ps.filter((p) => p.x + p.w / 2 < gutter), r.top, 0), b = mk(r.ps.filter((p) => p.x + p.w / 2 >= gutter), r.top, 1);
    if (a && !b && a.x1 - a.x0 < 4) { /* a stray mark */ }
    if (a) left.push(a); if (b) right.push(b);
  }
  flush(); return lines;
}

/** The whole PDF. `onPage` reports progress. Pages with (almost) no text are counted, so a scanned book is recognised. */
export async function readPdf(doc: any, onPage?: (done: number, total: number) => void): Promise<PdfRead> {
  const lines: Line[] = []; let textPages = 0; const fonts: Record<string, number> = {};
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n); const ls = await pageLines(page, n); const chars = ls.reduce((s, l) => s + l.pieces.reduce((m, p) => m + p.t.trim().length, 0), 0);
    if (chars > 60) textPages++; for (const l of ls) for (const p of l.pieces) fonts[p.font] = (fonts[p.font] || 0) + p.t.length;
    lines.push(...ls); page.cleanup?.(); if (onPage && (n % 5 === 0 || n === doc.numPages)) onPage(n, doc.numPages);
  }
  const outline: Outline[] = [];
  try { const walk = async (items: any[], level: number) => { for (const it of items || []) { let page = 0; try { let dest = it.dest; if (typeof dest === "string") dest = await doc.getDestination(dest); if (Array.isArray(dest) && dest[0]) page = typeof dest[0] === "number" ? dest[0] + 1 : (await doc.getPageIndex(dest[0])) + 1; } catch {} if (it.title?.trim()) outline.push({ title: it.title.trim(), page, level }); if (it.items?.length) await walk(it.items, level + 1); } }; await walk(await doc.getOutline(), 1); } catch {}
  let meta: PdfRead["meta"] = {}; try { const m = await doc.getMetadata(); meta = { title: m?.info?.Title || undefined, author: m?.info?.Author || undefined }; } catch {}
  return { lines, pages: doc.numPages, outline, meta, textPages, fonts };
}
