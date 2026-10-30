import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { syncSource, apiKey, type Source } from "@/lib/youtube-sync";

export const maxDuration = 300;
/** Daily: fetch new videos from every channel and playlist. Called by Vercel Cron. */
export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ ok: false });
  const key = await apiKey(); const out: any[] = [];
  for (const s of (await sql`select * from video_sources`) as Source[]) { try { out.push({ name: s.name, ...(await syncSource(s, key)) }); } catch (e: any) { out.push({ name: s.name, error: e.message }); } }
  revalidatePath("/teachings/videos"); return NextResponse.json({ results: out });
}
