import ExcelJS from "exceljs";
import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { AUDIO_KINDS, AUDIO_LANGS as LANGS, isSong } from "@/lib/content/text";

export const runtime = "nodejs";
const LECTURE_COLS: [string, string, number][] = [["Title", "e.g. The mercy of Śrīla Prabhupāda", 40], ["Type", "Choose from the list, or write a new one", 18], ["Date", "2026-01-21. Leave empty if not known", 14], ["Date note", "If the date is not known: e.g. Summer 1993", 20], ["Place", "Choose or write. Leave empty if not known", 18], ["Country", "", 14], ["MP3 link", "https://…/file.mp3", 40], ["Language", "Choose from the list, or write a new one", 18], ["Verse", "e.g. SB 1.2.6, BG 4.34", 14], ["Series", "", 18], ["Topics", "Separate with ;", 24], ["Length", "h:mm:ss", 10], ["Summary", "Two or three lines", 40]];
const SONG_COLS: [string, string, number][] = [["Title", "e.g. Śrī Guru-vandanā", 40], ["Type", "Choose from the list, or write a new one", 18], ["Date", "2026-01-21. Leave empty if not known", 14], ["Date note", "", 18], ["Place", "", 18], ["Country", "", 14], ["MP3 link", "https://…/file.mp3", 40], ["Language", "", 16], ["Song", "Name of the song", 26], ["Written by", "", 20], ["Sung by", "", 18], ["Series", "", 18], ["Topics", "Separate with ;", 20], ["Length", "h:mm:ss", 10]];

/** GET ?songs=1 — the Excel template, with the current Type, Place and Language lists as dropdowns. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const songs = new URL(req.url).searchParams.get("songs") === "1";
  const v = (await sql`select kind, name from vocab where kind in ('place', 'language', 'atype', 'stype') order by name`.catch(() => [])) as { kind: string; name: string }[];
  const list = (k: string, base: string[]) => Array.from(new Set([...base, ...v.filter((x) => x.kind === k).map((x) => x.name)]));
  const types = list(songs ? "stype" : "atype", AUDIO_KINDS.filter(([k]) => isSong(k) === songs && k !== "other").map(([, l]) => l));
  const langs = list("language", LANGS); const places = list("place", []);
  const COLS = songs ? SONG_COLS : LECTURE_COLS;
  const wb = new ExcelJS.Workbook(); wb.creator = "Taptajivanam Studio";
  const ws = wb.addWorksheet(songs ? "Kirtanas" : "Lectures", { views: [{ state: "frozen", ySplit: 2 }] });
  ws.columns = COLS.map(([h, , w]) => ({ header: h, width: w }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };
  const hint = ws.addRow(COLS.map((c) => c[1])); hint.font = { italic: true, color: { argb: "FF71717A" }, size: 9 };
  const L = wb.addWorksheet("Lists");
  [["Type", types], ["Language", langs], ["Place", places]].forEach(([h, arr], c) => { L.getCell(1, c + 1).value = h as string; L.getCell(1, c + 1).font = { bold: true }; (arr as string[]).forEach((x, r) => (L.getCell(r + 2, c + 1).value = x)); L.getColumn(c + 1).width = 24; });
  const col = (name: string) => COLS.findIndex((c) => c[0] === name) + 1;
  const ref = (c: string, n: number) => `Lists!$${c}$2:$${c}$${Math.max(2, n + 1)}`;
  for (let r = 3; r <= 2000; r++) {
    ws.getCell(r, col("Type")).dataValidation = { type: "list", allowBlank: true, showErrorMessage: false, formulae: [ref("A", types.length)] };
    ws.getCell(r, col("Language")).dataValidation = { type: "list", allowBlank: true, showErrorMessage: false, formulae: [ref("B", langs.length)] };
    if (places.length) ws.getCell(r, col("Place")).dataValidation = { type: "list", allowBlank: true, showErrorMessage: false, formulae: [ref("C", places.length)] };
    ws.getCell(r, col("Date")).numFmt = "yyyy-mm-dd";
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="${songs ? "kirtanas" : "audio-lectures"}-template.xlsx"` } });
}

/** POST an .xlsx (form field “file”) → its first sheet as rows of text, for the import screen. */
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const f = (await req.formData()).get("file") as File | null; if (!f) return fail("No file received.");
  const wb = new ExcelJS.Workbook(); try { await wb.xlsx.load(await f.arrayBuffer()); } catch { return fail("This file could not be read. Save it as .xlsx and try again."); }
  const ws = wb.worksheets.find((w) => w.name !== "Lists") || wb.worksheets[0]; const out: string[][] = [];
  ws.eachRow((r) => { out.push((r.values as any[]).slice(1).map((v) => {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v && typeof v === "object") { if ("text" in v) return String(v.text); if ("result" in v) return v.result instanceof Date ? v.result.toISOString().slice(0, 10) : String(v.result ?? ""); if ("richText" in v) return v.richText.map((t: any) => t.text).join(""); if ("hyperlink" in v) return String(v.hyperlink); }
    return v === null || v === undefined ? "" : String(v);
  })); });
  const width = Math.max(...out.map((r) => r.length)); out.forEach((r) => { while (r.length < width) r.push(""); });
  // Drop the hint row of our own template.
  if (out[1] && /^e\.g\./.test(out[1][0] || "")) out.splice(1, 1);
  return json({ rows: out.filter((r) => r.some((c) => c.trim())) });
}
