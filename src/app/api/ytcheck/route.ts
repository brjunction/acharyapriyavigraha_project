import { NextResponse } from "next/server";
import { listVideos, resolve } from "@/lib/youtube-sync";
export const maxDuration = 60;
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "accept-language": "en" };
/** Temporary check that whole-channel reading works from the server. Read-only. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams; const u = sp.get("u") || "@HaladharaSwami";
  try {
    const r = await resolve(u);
    if (sp.get("debug")) {
      const pl = r.kind === "channel" ? `UU${r.ref.slice(2)}` : r.ref;
      const out: any = { r };
      for (const url of [`https://www.youtube.com/playlist?list=${pl}&hl=en`, `https://www.youtube.com/channel/${r.ref}/videos?hl=en`]) {
        const res = await fetch(url, { headers: UA }); const html = await res.text();
        const tok = /"continuationCommand":\{"token":"([^"]+)"/.exec(html)?.[1] || null; const key = /"INNERTUBE_API_KEY":"([^"]+)"/.exec(html)?.[1]; const ver = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(html)?.[1];
        let browse: any = null; if (tok && key) { const br = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${key}`, { method: "POST", headers: { ...UA, "content-type": "application/json" }, body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: ver, hl: "en" } }, continuation: tok }) }); const t = await br.text(); browse = { status: br.status, len: t.length, lockup: (t.match(/lockupViewModel/g) || []).length, pvr: (t.match(/playlistVideoRenderer/g) || []).length, keys: Object.keys(JSON.parse(t || "{}")), head: t.slice(0, 200) }; }
        out[url + "#cont"] = { cir: (html.match(/continuationItemRenderer/g) || []).length, cc: (html.match(/continuationCommand/g) || []).length, tok: tok?.slice(0, 20), ver, browse };
        out[url] = { status: res.status, len: html.length, init: html.includes("ytInitialData"), pvr: (html.match(/playlistVideoRenderer/g) || []).length, lockup: (html.match(/lockupViewModel/g) || []).length, rich: (html.match(/richItemRenderer/g) || []).length, videoRenderer: (html.match(/"videoRenderer"/g) || []).length, consent: html.includes("consent.youtube"), key: /INNERTUBE_API_KEY/.test(html), sample: html.slice(html.indexOf("ytInitialData"), html.indexOf("ytInitialData") + 120) };
      }
      return NextResponse.json(out);
    }
    const t0 = Date.now(); const v = await listVideos(r, null, 3000); return NextResponse.json({ r, n: v.length, ms: Date.now() - t0, first: v.slice(0, 3), last: v.slice(-2) });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}
