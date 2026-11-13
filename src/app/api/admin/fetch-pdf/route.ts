import { guard } from "@/lib/api";
import { directPdf } from "@/lib/content/pdf-link";

/* For the Studio: a PDF given as a link is fetched once through here (the browser cannot read most hosts directly), so its
   cover, number, date and contents can be read. Nothing is stored. Editors only; public https addresses only. */
export async function GET(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const raw = new URL(req.url).searchParams.get("url") || ""; let u: URL;
  try { u = new URL(directPdf(raw.trim())); } catch { return new Response("That is not a link.", { status: 400 }); }
  if (u.protocol !== "https:" || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[|0\.)/i.test(u.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) return new Response("Only public https links can be used.", { status: 400 });
  const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 Taptajivanam" }, redirect: "follow" }).catch(() => null);
  if (!r || !r.ok) return new Response("The PDF could not be reached at that link.", { status: 502 });
  const len = Number(r.headers.get("content-length") || 0); if (len > 150_000_000) return new Response("That PDF is too large.", { status: 413 });
  const h = new Headers({ "content-type": "application/pdf", "cache-control": "no-store" }); if (len) h.set("content-length", String(len));
  return new Response(r.body, { status: 200, headers: h });
}
