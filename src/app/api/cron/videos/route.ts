import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { syncStep, apiKey } from "@/lib/youtube-sync";
import { freshSite } from "@/lib/fresh";
import { feedKinds } from "@/lib/video-home";

export const maxDuration = 300;
/** Daily: fetch new videos from every channel and playlist. Called by Vercel Cron. */
export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ ok: false });
  const key = await apiKey(); const out: any[] = [];
  // Unfinished fetches first, then the longest unfetched; each is carried a step further until time runs out (the next run carries on).
  const t0 = Date.now(); const list = (await sql`select id from video_sources where not hidden order by (sync_state is null), last_synced_at asc nulls first`) as any[];
  for (const { id } of list) {
    while (Date.now() - t0 < 250000) { const s = (await sql`select * from video_sources where id = ${id}`)[0] as any; const r = await syncStep(s, key, Math.min(40000, 280000 - (Date.now() - t0))); if (r.state !== "working") { out.push({ name: s.name, ...r }); break; } }
    if (Date.now() - t0 >= 250000) break;
  }
  try { await feedKinds(); } catch {}
  freshSite(); return NextResponse.json({ results: out });
}
