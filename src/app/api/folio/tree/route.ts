import { NextResponse } from "next/server";
import { children } from "@/lib/folio";
export async function GET(req: Request) { const id = new URL(req.url).searchParams.get("id") || ""; return NextResponse.json(await children(id).catch(() => []), { headers: { "cache-control": "public, max-age=60, s-maxage=300" } }); }
