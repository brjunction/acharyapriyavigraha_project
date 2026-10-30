import { nav, groupPage } from "@/lib/webfolio/data";
import { docText } from "@/components/cms/doc-text";
import { sql, hasDb } from "@/lib/db";

export const maxDuration = 300;
const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const paras = (t: string) => esc(t).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
/** The whole WebFolio text as one HTML file. */
export async function GET() {
  const n = await nav(); let body = ""; let toc = "";
  for (const s of n) {
    toc += `<li><a href="#${s.key}">${esc(s.title)}</a><ul>`; body += `<h1 id="${s.key}">${esc(s.title)}</h1>`;
    for (const g of s.groups) {
      const p = await groupPage(s.key, g.key); if (!p) continue; const id = `${s.key}-${g.key}`; toc += `<li><a href="#${id}">${esc(g.title)}</a></li>`;
      body += `<h2 id="${id}">${esc(p.title)}</h2>${p.intro ? `<p class="m">${esc(p.intro)}</p>` : ""}`;
      for (const b of p.blocks) {
        let text = [b.text, b.doc?.length ? docText(b.doc, 500000) : ""].filter(Boolean).join("\n\n");
        if (p.list && (s.key === "transcriptions") && hasDb()) { const r = (await sql`select transcript from audios where slug = ${b.id}`.catch(() => []))[0] as any; text = r ? docText(r.transcript || [], 500000) : ""; }
        body += `<h3>${esc(b.title)}</h3>${b.sub ? `<p class="m">${esc(b.sub)}</p>` : ""}${text ? paras(text) : ""}`;
      }
    }
    toc += "</ul></li>";
  }
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WebFolio — Taptajīvanam</title><style>body{font:16px/1.75 Georgia,serif;max-width:760px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{font:600 30px/1.2 system-ui,sans-serif;margin:64px 0 8px;border-top:1px solid #e5e5e5;padding-top:32px}h2{font:600 22px/1.3 system-ui,sans-serif;margin:40px 0 4px}h3{font:600 17px/1.35 system-ui,sans-serif;margin:28px 0 4px}.m{color:#737373;font:13px system-ui,sans-serif;margin:0 0 8px}nav ul{font:14px/1.6 system-ui,sans-serif}a{color:#853500}</style></head><body><p class="m">Exported ${new Date().toLocaleDateString("en-GB")} from taptajivanam.com/webfolio</p><h1 style="border:0;margin-top:0;padding:0">WebFolio</h1><p>The teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p><nav><ul>${toc}</ul></nav>${body}</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "content-disposition": `attachment; filename="webfolio-${new Date().toISOString().slice(0, 10)}.html"` } });
}
