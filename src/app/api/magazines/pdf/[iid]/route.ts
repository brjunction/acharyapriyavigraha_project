import { sql } from "@/lib/db";

/* An issue's PDF from wherever it is kept (a link given in the Studio), passed through this site so the reader can open
   it page by page from any host. Only the links stored on published issues are fetched — never any other address. */
const ID = /^[0-9a-f-]{36}$/i;
/** Turn share links into direct file links (Google Drive, Dropbox). */
export function directPdf(u: string) {
  const d = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]{20,})/.exec(u); if (d) return `https://drive.usercontent.google.com/download?id=${d[1]}&export=download&confirm=t`;
  if (/dropbox\.com\//.test(u)) return u.replace(/[?&]dl=0/, "").replace(/(\?|$)/, (x) => (x ? "?dl=1&" : "?dl=1"));
  return u;
}
export async function GET(req: Request, { params }: { params: Promise<{ iid: string }> }) {
  const { iid } = await params; if (!ID.test(iid)) return new Response("Not found", { status: 404 });
  const i = (await sql`select pdf_url from magazine_issues where id = ${iid} and status = 'published'`)[0] as any;
  if (!i?.pdf_url || !/^https?:\/\//.test(i.pdf_url)) return new Response("Not found", { status: 404 });
  const h: Record<string, string> = { "user-agent": "Mozilla/5.0 Taptajivanam" }; const range = req.headers.get("range"); if (range) h.range = range;
  const r = await fetch(directPdf(i.pdf_url), { headers: h, redirect: "follow" });
  if (!r.ok && r.status !== 206) return new Response("The PDF could not be reached.", { status: 502 });
  const out = new Headers({ "content-type": "application/pdf", "cache-control": "public, max-age=86400, s-maxage=604800" });
  for (const k of ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) { const v = r.headers.get(k); if (v) out.set(k, v); }
  return new Response(r.body, { status: r.status, headers: out });
}
