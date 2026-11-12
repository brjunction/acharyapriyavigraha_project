import { guard, json, fail } from "@/lib/api";
import { aiConfig, askAI, OCR_SYSTEM } from "@/lib/ai";

export const maxDuration = 300;
/** One scanned page (a JPEG made in the browser) → its text as Markdown, read by the AI set in Studio → Settings. { image: "data:image/jpeg;base64,…", page } */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json().catch(() => null);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(b?.image || "")); if (!m) return fail("No page picture received.");
  if (m[2].length > 5_500_000) return fail("That page picture is too large.");
  const cfg = await aiConfig(); if (!cfg) return fail("No AI key yet. An admin can add one in Studio → Settings → AI assistant; it is needed to read scanned pages.");
  try { const t = (await askAI(cfg, OCR_SYSTEM, `This is page ${Number(b.page) || "?"} of the book. Type it out.`, 8000, { type: m[1], base64: m[2] })).trim(); return json({ text: /^\[empty\]$/i.test(t) ? "" : t }); }
  catch (e: any) { return fail(String(e?.message || e).slice(0, 300), 502); }
}
