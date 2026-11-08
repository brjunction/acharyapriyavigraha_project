/* The fallback address for a recording kept on Archive.org. Answers from the saved direct address at once;
   when that is a few days old, the whole collection's addresses are refreshed in the background (after the answer). */
import { after } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { resolveArchive, refreshItemDirect } from "@/lib/archive";
import { archiveDownload } from "@/lib/archive-url";

const STALE = 3 * 24 * 3600 * 1000;
export async function GET(req: Request, { params }: { params: Promise<{ item: string; file: string[] }> }) {
  const { item: i, file: f } = await params; const item = decodeURIComponent(i); const file = f.map((x) => decodeURIComponent(x)).join("/");
  const sp = new URL(req.url).searchParams; const failed = sp.has("retry"); const alt = sp.has("alt");
  let to: string | null = null; let old = true;
  if (hasDb()) { try { const r = (await sql`select audio_direct, audio_direct2, audio_direct_at from audios where audio_url = ${archiveDownload(item, file)} limit 1`)[0] as any; const u = alt ? r?.audio_direct2 || null : r?.audio_direct; if (u && !failed) { to = u; old = !r.audio_direct_at || Date.now() - new Date(r.audio_direct_at).getTime() > STALE; } if (alt && r && !r.audio_direct2) old = true; } catch {} }
  if (!to) { to = await resolveArchive(item, file); old = true; }
  if (old && hasDb()) after(async () => { try { await refreshItemDirect(item); } catch {} });
  return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
