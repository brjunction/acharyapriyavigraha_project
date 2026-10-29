import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const { id } = await params; const v = new URL(req.url).searchParams.get("v");
  if (v) { const r = await sql`select blocks from page_versions where id = ${v} and page_id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404); }
  return json(await sql`select id, created_at from page_versions where page_id = ${id} order by created_at desc limit 30`);
}
