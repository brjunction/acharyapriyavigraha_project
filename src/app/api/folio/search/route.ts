import { NextResponse } from "next/server";
import { search } from "@/lib/folio";
export async function GET(req: Request) { const q = new URL(req.url).searchParams.get("q") || ""; return NextResponse.json(await search(q.slice(0, 120)).catch(() => ({ total: 0, groups: [] })), { headers: { "cache-control": "public, max-age=30, s-maxage=120" } }); }
