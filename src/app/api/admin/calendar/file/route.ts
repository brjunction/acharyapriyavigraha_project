import ExcelJS from "exceljs";
import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { CAL_COLS, CAL_KINDS } from "@/lib/content/calendar";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
const kindOf = (v: string) => CAL_KINDS.find(([k, l]) => k === v.toLowerCase() || l.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "") === v.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, ""))?.[0] || "other";
const iso = (v: any) => { if (v instanceof Date) return v.toISOString().slice(0, 10); const s = String(v ?? "").trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(s); if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; const d = new Date(s); return isNaN(+d) ? null : d.toISOString().slice(0, 10); };

/** GET ?type=template|export&format=xlsx|csv&year= — the Excel template, or this year's calendar to edit and send back. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams; const type = u.get("type") || "template"; const format = u.get("format") || "xlsx"; const year = u.get("year");
  const rows = type === "export" ? await sql`select to_char(date, 'YYYY-MM-DD') as date, title, kind, fasting, paran, description, location, link from calendar_events where (${year}::text is null or extract(year from date)::text = ${year}) order by date` : [];
  const data = type === "export" ? rows.map((r: any) => CAL_COLS.map(([k]) => (k === "kind" ? CAL_KINDS.find(([x]) => x === r.kind)?.[1] || r.kind : r[k] ?? ""))) : [CAL_COLS.map((c) => c[2])];
  const name = type === "export" ? `vaishnava-calendar-${year || "all"}` : "vaishnava-calendar-template";
  if (format === "csv") {
    const esc = (v: any) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = "﻿" + [CAL_COLS.map((c) => c[1]), ...data].map((r) => r.map(esc).join(",")).join("\r\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}.csv"` } });
  }
  const wb = new ExcelJS.Workbook(); wb.creator = "Taptajivanam Studio";
  const ws = wb.addWorksheet("Calendar", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = CAL_COLS.map(([k, l]) => ({ header: l, key: k, width: k === "title" || k === "description" ? 36 : k === "fasting" ? 30 : 16 }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF853500" } };
  data.forEach((r) => ws.addRow(r));
  for (let i = 2; i <= 1000; i++) ws.getCell(`C${i}`).dataValidation = { type: "list", allowBlank: true, formulae: [`"${CAL_KINDS.map(([, l]) => l).join(",")}"`] };
  const help = wb.addWorksheet("How to fill");
  [["How to fill this sheet"], [""], ["Date", "Write as 2026-11-25 (year-month-day). Excel dates also work."], ["Event", "The name, e.g. Utpannā Ekādaśī, Rādhāṣṭamī."], ["Kind", "Choose from the list: " + CAL_KINDS.map(([, l]) => l).join(", ")], ["Fasting", "What the fast is, e.g. “Fast till noon”."], ["Break fast", "Pāraṇa time, e.g. 06:10–09:45."], ["Calendar for", "The place this calendar is calculated for, e.g. Bhubaneswar. Keep one place per row."], [""], ["Send the file back in the Studio: Vaiṣṇava calendar → Import. Rows with the same date, event and place are updated, not doubled."]].forEach((r) => help.addRow(r));
  help.getColumn(1).width = 16; help.getColumn(2).width = 90; help.getRow(1).font = { bold: true, size: 14 };
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="${name}.xlsx"` } });
}

/** POST a filled Excel or CSV file (form field “file”). Same date + event + place updates the row. ?replaceYear=2027 first removes that year’s events for the places in the file. */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const f = (await req.formData()).get("file") as File | null; if (!f) return fail("No file received.");
  let table: any[][] = [];
  if (/\.csv$/i.test(f.name) || f.type.includes("csv")) {
    const text = (await f.text()).replace(/^﻿/, ""); let row: string[] = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); table.push(row); row = []; cell = ""; } else cell += c; }
    if (cell || row.length) { row.push(cell); table.push(row); }
  } else {
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await f.arrayBuffer()); const ws = wb.worksheets[0];
    ws.eachRow((r) => { const vals = (r.values as any[]).slice(1).map((v) => (v && typeof v === "object" && "text" in v ? v.text : v && typeof v === "object" && "result" in v ? v.result : v)); table.push(vals); });
  }
  if (table.length < 2) return fail("The sheet is empty.");
  const head = table[0].map((h) => String(h ?? "").trim().toLowerCase());
  const idx = Object.fromEntries(CAL_COLS.map(([k, l]) => [k, head.findIndex((h) => h === l.toLowerCase() || h === k)]));
  if (idx.date < 0 || idx.title < 0) return fail("The first row must have the columns “Date” and “Event”. Download the template to see the layout.");
  const replace = new URL(req.url).searchParams.get("replaceYear");
  const items = table.slice(1).map((r) => ({ date: iso(r[idx.date]), title: String(r[idx.title] ?? "").trim(), kind: idx.kind >= 0 && r[idx.kind] ? kindOf(String(r[idx.kind])) : "festival", fasting: idx.fasting >= 0 ? String(r[idx.fasting] ?? "").trim() || null : null, paran: idx.paran >= 0 ? String(r[idx.paran] ?? "").trim() || null : null, description: idx.description >= 0 ? String(r[idx.description] ?? "").trim() || null : null, location: idx.location >= 0 ? String(r[idx.location] ?? "").trim() || "Bhubaneswar" : "Bhubaneswar", link: idx.link >= 0 ? String(r[idx.link] ?? "").trim() || null : null }))
    .filter((x) => x.date && x.title);
  if (replace) { const locs = Array.from(new Set(items.map((i) => i.location))); await sql`delete from calendar_events where extract(year from date)::text = ${replace} and location = any(${locs})`; }
  let added = 0, updated = 0;
  for (const it of items) {
    const ex = (await sql`select id from calendar_events where date = ${it.date} and lower(title) = lower(${it.title}) and location = ${it.location}`)[0];
    if (ex) { await sql`update calendar_events set kind = ${it.kind}, fasting = ${it.fasting}, paran = ${it.paran}, description = ${it.description}, link = ${it.link}, updated_at = now() where id = ${ex.id}`; updated++; }
    else { await sql`insert into calendar_events (date, title, kind, fasting, paran, description, location, link) values (${it.date}, ${it.title}, ${it.kind}, ${it.fasting}, ${it.paran}, ${it.description}, ${it.location}, ${it.link})`; added++; }
  }
  revalidatePath("/resources/vaishnava-calendar"); return json({ added, updated, skipped: table.length - 1 - items.length });
}
