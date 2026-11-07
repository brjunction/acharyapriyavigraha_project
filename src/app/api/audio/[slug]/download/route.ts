import { sql, hasDb } from "@/lib/db";
import { fileTitle } from "@/lib/content/audio-names";

/** Downloads a recording under its proper file name, e.g. 1977_10_11_Bhubaneswar_Bhagavatam_10_66.mp3. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: code } = await params; if (!hasDb()) return new Response("Not found", { status: 404 });
  const a = (await sql`select * from audios where (code = ${code} or slug = ${code}) and status = 'published'`.catch(() => []))[0] as any;
  if (!a?.audio_url) return new Response("This recording has no audio file yet.", { status: 404 });
  const r = await fetch(a.audio_url); if (!r.ok || !r.body) return Response.redirect(a.audio_url, 302);
  const name = `${(a.file_title || fileTitle(a)).replace(/\.mp3$/i, "")}.mp3`;
  return new Response(r.body, { headers: { "content-type": r.headers.get("content-type") || "audio/mpeg", ...(r.headers.get("content-length") ? { "content-length": r.headers.get("content-length")! } : {}), "content-disposition": `attachment; filename="${name.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`, "cache-control": "public, max-age=86400" } });
}
