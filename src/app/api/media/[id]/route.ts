import { sql } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const r = await sql`select data, mime from media where id = ${id}`;
  if (!r[0]) return new Response("Not found", { status: 404 });
  const d = r[0].data as Buffer | Uint8Array;
  return new Response(new Uint8Array(d), { headers: { "content-type": r[0].mime as string, "cache-control": "public, max-age=31536000, immutable", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } });
}
