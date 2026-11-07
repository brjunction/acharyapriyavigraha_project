import { sql, hasDb } from "@/lib/db";

/** Errors met in visitors' browsers are kept too (site_errors), a few at a time. */
export async function POST(req: Request) {
  if (!hasDb()) return new Response(null, { status: 204 });
  try {
    const b = await req.json();
    const recent = ((await sql`select count(*)::int as n from site_errors where at > now() - interval '1 minute'`)[0] as any).n; if (recent > 60) return new Response(null, { status: 204 });
    await sql`insert into site_errors (side, path, message, stack, digest, ua) values ('browser', ${String(b.path || "").slice(0, 500)}, ${String(b.message || "").slice(0, 2000)}, ${String(b.stack || "").slice(0, 4000)}, ${b.digest ? String(b.digest) : null}, ${String(req.headers.get("user-agent") || "").slice(0, 300)})`;
  } catch {}
  return new Response(null, { status: 204 });
}
