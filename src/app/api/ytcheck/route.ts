import { NextResponse } from "next/server";
import { listVideos, resolve } from "@/lib/youtube-sync";
export const maxDuration = 60;
/** Temporary check that whole-channel reading works from the server. Read-only. */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") || "@HaladharaSwami";
  try { const r = await resolve(u); const t0 = Date.now(); const v = await listVideos(r, null, 3000); return NextResponse.json({ r, n: v.length, ms: Date.now() - t0, first: v.slice(0, 3), last: v.slice(-2) }); }
  catch (e: any) { return NextResponse.json({ error: e.message }); }
}
