import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";
import { nav } from "@/lib/webfolio/data";

/** Every WebFolio page that holds text, for “Keep all text offline”. */
export async function GET() {
  const n = await nav(); const urls = ["/webfolio", ...n.flatMap((s) => [`/webfolio/${s.key}`, ...s.groups.map((g) => `/webfolio/${s.key}/${g.key}`)])];
  if (hasDb()) { try { const rows = (await sql`select slug, kind, coalesce(extract(year from date)::int, 0) y from audios where status = 'published' and jsonb_array_length(transcript) > 0`) as any[]; for (const r of rows) urls.push(`/webfolio/${r.kind === "kirtan" || r.kind === "bhajan" ? "kirtans" : "lectures"}/${r.y || "undated"}/${r.slug}`); } catch {} }
  return NextResponse.json({ urls });
}
