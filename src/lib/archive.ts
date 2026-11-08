/* Archive.org: reading a collection's file list, finding where a file is served from today,
   and reading the date / verse / place from a recording's file name. Server only. */
import { archiveDownload, archiveRef } from "./archive-url";
import { sql } from "./db";

type Meta = { server?: string; d1?: string; d2?: string; dir?: string; files: { name: string; format?: string; source?: string; length?: string; size?: string; title?: string; original?: string }[]; title?: string };
const cache = new Map<string, { at: number; meta: Meta }>();
const TTL = 60 * 60 * 1000;

export async function itemMeta(item: string, fresh = false): Promise<Meta | null> {
  const c = cache.get(item); if (!fresh && c && Date.now() - c.at < TTL) return c.meta;
  try {
    const r = await fetch(`https://archive.org/metadata/${encodeURIComponent(item)}`, { cache: "no-store", signal: AbortSignal.timeout(12000), headers: { "user-agent": "Taptajivanam website" } });
    if (!r.ok) return c?.meta ?? null; const j = await r.json(); if (!j || !Array.isArray(j.files)) return c?.meta ?? null;
    const meta: Meta = { server: j.server, d1: j.d1, d2: j.d2, dir: j.dir, files: j.files, title: j.metadata?.title };
    cache.set(item, { at: Date.now(), meta }); return meta;
  } catch { return c?.meta ?? null; }
}

/** Where the file is served from right now; the lasting download address if Archive.org cannot be asked. */
export async function resolveArchive(item: string, file: string) {
  const fallback = archiveDownload(item, file);
  const m = await itemMeta(item); if (!m) return fallback;
  if (!m.files.some((f) => f.name === file)) return fallback;
  const host = m.d1 || m.server; if (!host || !m.dir) return fallback;
  return `https://${host}${m.dir}/${file.split("/").map(encodeURIComponent).join("/")}`;
}

const secs = (l?: string) => { if (!l) return null; if (/^\d+(\.\d+)?$/.test(l)) return Math.round(Number(l)); const p = l.split(":").map(Number); if (p.some(isNaN)) return null; return p.reduce((a, b) => a * 60 + b, 0) || null; };
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const yr = (y: string) => (y.length === 4 ? Number(y) : Number(y) >= 40 ? 1900 + Number(y) : 2000 + Number(y));
const pad = (n: number) => String(n).padStart(2, "0");
/** Place codes seen in the archive's file names. Check them in the preview before importing. */
export const PLACES: Record<string, [string, string]> = {
  BBSR: ["Bhubaneswar", "India"], PURI: ["Puri", "India"], MYPR: ["Mayapur", "India"], VRN: ["Vrindavan", "India"], CTC: ["Cuttack", "India"], KOL: ["Kolkata", "India"], GDG: ["Gadeigiri", "India"], DEL: ["Delhi", "India"], BOM: ["Mumbai", "India"],
  MAU: ["Mauritius", "Mauritius"], DUR: ["Durban", "South Africa"], JOH: ["Johannesburg", "South Africa"],
};
const SCR: Record<string, string> = { SB: "Śrīmad-Bhāgavatam", BG: "Bhagavad-gītā", CC: "Caitanya-caritāmṛta" };

export type Parsed = { name: string; title: string; date: string | null; date_note: string | null; place: string | null; country: string | null; scripture: string | null; canto: number | null; chapter: number | null; verse: string | null; duration_sec: number | null; size: number | null };
export function parseName(name: string, length?: string, size?: string): Parsed {
  let rest = name.replace(/\.mp3$/i, "").replace(/_/g, " ").trim();
  let date: string | null = null, date_note: string | null = null;
  let m: RegExpExecArray | null;
  if ((m = /^(\d{2}|\d{4})-(\d{1,2})-(\d{1,2})(?:-\d{1,2})?\b\s*/.exec(rest))) { const y = yr(m[1]), mo = Number(m[2]), d = Number(m[3]); if (mo >= 1 && mo <= 12) { if (d >= 1 && d <= 31) date = `${y}-${pad(mo)}-${pad(d)}`; else date_note = `${MON[mo - 1]} ${y}`; } rest = rest.slice(m[0].length); }
  else if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})\b\s*/.exec(rest))) { const d = Number(m[1]), mo = Number(m[2]), y = yr(m[3]); if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) date = `${y}-${pad(mo)}-${pad(d)}`; rest = rest.slice(m[0].length); }
  else if ((m = /^(\d{2}|\d{4})-(\d{1,2})\b\s*/.exec(rest))) { const y = yr(m[1]), mo = Number(m[2]); if (mo >= 1 && mo <= 12) date_note = `${MON[mo - 1]} ${y}`; rest = rest.slice(m[0].length); }
  else if ((m = /^(\d{1,2})\.(\d{2})\b\s*/.exec(rest))) { const mo = Number(m[1]), y = yr(m[2]); if (mo >= 1 && mo <= 12) date_note = `${MON[mo - 1]} ${y}`; rest = rest.slice(m[0].length); }
  // a date written as 960115 (year, month, day) anywhere in the name
  if (!date && !date_note && (m = /(?:^|\s)(\d{2})(\d{2})(\d{2})(?=\s|$)/.exec(rest))) { const y = yr(m[1]), mo = Number(m[2]), d = Number(m[3]); if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) { date = `${y}-${pad(mo)}-${pad(d)}`; rest = rest.replace(m[0], " "); } }
  // a short code before the date (e.g. "DUC 96-2 …")
  if (!date && !date_note && (m = /^([A-Z]{2,4})\s+(\d{2})-(\d{1,2})(?:-(\d{1,2}))?\b\s*/.exec(rest))) { const y = yr(m[2]), mo = Number(m[3]), d = Number(m[4] || 0); if (mo >= 1 && mo <= 12) { if (d >= 1 && d <= 31) date = `${y}-${pad(mo)}-${pad(d)}`; else date_note = `${MON[mo - 1]} ${y}`; rest = `${m[1]} ${rest.slice(m[0].length)}`; } }
  let scripture: string | null = null, canto: number | null = null, chapter: number | null = null, verse: string | null = null, ref = "";
  if ((m = /\b(SB|BG|CC)\s?(\d+)\.(\d+)(?:\.([\d-]+))?/.exec(rest))) {
    scripture = m[1];
    if (m[1] === "BG") { chapter = Number(m[2]); verse = m[3]; ref = `${SCR.BG} ${chapter}.${verse}`; }
    else { canto = Number(m[2]); chapter = Number(m[3]); verse = m[4] || null; ref = `${SCR[m[1]]} ${[canto, chapter, verse].filter(Boolean).join(".")}`; }
    rest = rest.replace(m[0], " ");
  }
  let place: string | null = null, country: string | null = null;
  for (const [code, [p, c]] of Object.entries(PLACES)) { const r = new RegExp(`\\b${code}\\b`); if (r.test(rest)) { place = p; country = c; rest = rest.replace(r, " "); break; } }
  const part = /\bP(I{1,3}|IV)\b/.exec(rest); if (part) rest = rest.replace(part[0], " ");
  const rec = /\bRec\s?(\d)\b/i.exec(rest); if (rec) rest = rest.replace(rec[0], " ");
  rest = rest.replace(/\b(BTM\d+[A-Z]?|MDR\d+|HI8|AD-\d+|ORG|MST(?:side[AB])?|TS)\b/g, " ").replace(/\s*-\s*$/, "").replace(/\s{2,}/g, " ").replace(/^[\s&-]+|[\s&-]+$/g, "").trim();
  // codes whose meaning the names themselves show; others are left for the editor to correct in the preview
  for (const [code, full] of [["RI", "Radio interview"], ["PA", "Public address"], ["SB", "Śrīmad-Bhāgavatam"], ["BG", "Bhagavad-gītā"]] as const) {
    const r = new RegExp(`(^|\\s)${code}(?=\\s|$)`); if (!r.test(rest)) continue;
    rest = new RegExp(full.split(" ")[0].normalize("NFKD").replace(/[\u0300-\u036f]/g, "").slice(0, 5), "i").test(rest.replace(r, " ").normalize("NFKD")) ? rest.replace(r, " ").trim() : rest.replace(r, `$1${full} ·`).trim();
  }
  rest = rest.replace(/·\s*$/, "").trim();
  const partN = part ? ({ I: 1, II: 2, III: 3, IV: 4 } as Record<string, number>)[part[1]] : 0;
  let title = [ref, rest].filter(Boolean).join(" · ") || name.replace(/\.mp3$/i, "");
  if (partN) title += ` — Part ${partN}`; if (rec) title += ` (recording ${rec[1]})`;
  return { name, title, date, date_note, place, country, scripture, canto, chapter, verse, duration_sec: secs(length), size: size ? Number(size) || null : null };
}

/** One request to Archive.org refreshes the saved direct address of every recording from that collection. */
export async function refreshItemDirect(item: string) {
  const m = await itemMeta(item, true); const host = m?.d1 || m?.server; if (!m || !host || !m.dir) return 0;
  const rows = (await sql`select id, audio_url from audios where audio_url like ${`https://archive.org/download/${item}/%`}`) as { id: string; audio_url: string }[];
  const names = new Set(m.files.map((f) => f.name)); const ids: string[] = []; const urls: string[] = [];
  for (const r of rows) { const ref = archiveRef(r.audio_url); if (!ref || !names.has(ref.file)) continue; ids.push(r.id); urls.push(`https://${host}${m.dir}/${ref.file.split("/").map(encodeURIComponent).join("/")}`); }
  if (ids.length) await sql`update audios a set audio_direct = t.u, audio_direct_at = now() from unnest(${ids}::uuid[], ${urls}::text[]) as t(i, u) where a.id = t.i`;
  return ids.length;
}
