/* The fallback address for a recording kept on Archive.org. Answers from the saved direct address at once;
   when that is a few days old, the whole collection's addresses are refreshed in the background (after the answer). */
import { after } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { resolveArchive, refreshItemDirect } from "@/lib/archive";
import { archiveDownload } from "@/lib/archive-url";

const STALE = 3 * 24 * 3600 * 1000;
export async function GET(req: Request, { params }: { params: Promise<{ item: string; file: string[] }> }) {
  const { item: i, file: f } = await params; const item = decodeURIComponent(i); const file = f.map((x) => decodeURIComponent(x)).join("/");
  const failed = new URL(req.url).searchParams.has("retry");
  let to: string | null = null; let old = true;
  if (hasDb()) { try { const r = (await sql`select audio_direct, audio_direct_at from audios where audio_url = ${archiveDownload(item, file)} limit 1`)[0] as any; if (r?.audio_direct && !failed) { to = r.audio_direct; old = !r.audio_direct_at || Date.now() - new Date(r.audio_direct_at).getTime() > STALE; } } catch {} }
  if (!to) { to = await resolveArchive(item, file); old = true; }
  if (old && hasDb()) after(async () => { try { await refreshItemDirect(item); } catch {} });
  return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
