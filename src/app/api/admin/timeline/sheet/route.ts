import ExcelJS from "exceljs";
import { sql } from "@/lib/db";
import { guard } from "@/lib/api";
import { KINDS, IMPORTANCE, SHEET_COLS as COLS } from "@/lib/content/timeline";
import { POST as parse } from "../../audios/sheet/route";

export async function POST(req: Request) { return parse(req); }

export const runtime = "nodejs";

/** The Excel template, with Kind and Importance as dropdowns. Existing events are listed on a second sheet for reference. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const wb = new ExcelJS.Workbook(); wb.creator = "Taptajivanam Studio";
  const ws = wb.addWorksheet("Timeline", { views: [{ state: "frozen", ySplit: 2 }] });
  ws.columns = COLS.map(([h, , w]) => ({ header: h, width: w }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };
  const hint = ws.addRow(COLS.map((c) => c[1])); hint.font = { italic: true, color: { argb: "FF71717A" }, size: 9 }; hint.getCell(1).value = "e.g. 1975 (required)";
  const L = wb.addWorksheet("Lists"); L.getCell(1, 1).value = "Kind"; L.getCell(1, 2).value = "Importance";
  KINDS.forEach(([, l], i) => (L.getCell(i + 2, 1).value = l)); IMPORTANCE.forEach(([, l], i) => (L.getCell(i + 2, 2).value = l)); L.getColumn(1).width = 26;
  const c = (n: string) => COLS.findIndex((x) => x[0] === n) + 1;
  for (let r = 3; r <= 1500; r++) {
    ws.getCell(r, c("Kind")).dataValidation = { type: "list", allowBlank: true, showErrorMessage: false, formulae: [`Lists!$A$2:$A$${KINDS.length + 1}`] };
    ws.getCell(r, c("Importance")).dataValidation = { type: "list", allowBlank: true, showErrorMessage: false, formulae: [`Lists!$B$2:$B$${IMPORTANCE.length + 1}`] };
  }
  const have = (await sql`select year, title from life_events order by year`.catch(() => [])) as any[];
  if (have.length) { const E = wb.addWorksheet("Already in the timeline"); E.columns = [{ header: "Year", width: 8 }, { header: "Title", width: 50 }]; have.forEach((h) => E.addRow([h.year, h.title])); }
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": 'attachment; filename="life-timeline-template.xlsx"' } });
}
