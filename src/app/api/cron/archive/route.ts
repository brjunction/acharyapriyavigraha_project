import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { refreshItemDirect } from "@/lib/archive";

export const maxDuration = 120;
/** Daily: refresh the saved direct MP3 address of every recording kept on Archive.org (one request per collection). Called by Vercel Cron. */
export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ ok: false });
  const items = ((await sql`select distinct split_part(substr(audio_url, 30), '/', 1) as item from audios where audio_url like 'https://archive.org/download/%'`) as any[]).map((r) => r.item).filter(Boolean);
  const out: Record<string, number> = {};
  for (const it of items) { try { out[it] = await refreshItemDirect(decodeURIComponent(it)); } catch { out[it] = -1; } }
  return NextResponse.json({ ok: true, refreshed: out });
}
