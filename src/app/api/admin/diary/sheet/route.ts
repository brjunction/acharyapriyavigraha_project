import ExcelJS from "exceljs";
import { guard } from "@/lib/api";
import { POST as parse } from "../../audios/sheet/route";

export const runtime = "nodejs";
export async function POST(req: Request) { return parse(req); }
/** Excel template: one row per diary page. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const COLS: [string, string, number][] = [["Date", "e.g. 1979-11-02. Empty if not known", 14], ["Date as written", "If the date is not exact: Kārttika 1979", 22], ["Notebook", "Volume / notebook number", 12], ["Page", "Page in the notebook", 8], ["Translation", "The English translation (long text is fine)", 90]];
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet("Diary", { views: [{ state: "frozen", ySplit: 2 }] });
  ws.columns = COLS.map(([h, , w]) => ({ header: h, width: w }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18181B" } };
  const hint = ws.addRow(COLS.map((c) => c[1])); hint.font = { italic: true, color: { argb: "FF71717A" }, size: 9 };
  for (let r = 3; r <= 3000; r++) { ws.getCell(r, 1).numFmt = "yyyy-mm-dd"; ws.getCell(r, 5).alignment = { wrapText: true, vertical: "top" }; }
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": 'attachment; filename="diary-template.xlsx"' } });
}
