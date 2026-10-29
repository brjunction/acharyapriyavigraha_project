import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

export async function GET() {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  return json(await sql`select id, filename, mime, size, alt, created_at from media order by created_at desc limit 300`);
}
export async function POST(req: Request) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const f = (await req.formData()).get("file") as File | null;
  if (!f) return fail("No file received.");
  if (!/^image\/(png|jpe?g|webp|gif|svg\+xml|avif)$/.test(f.type)) return fail("Please upload a PNG, JPG, WebP, GIF, AVIF or SVG picture.");
  if (f.size > 4_000_000) return fail("That picture is over 4 MB. Please make it smaller.");
  const hex = Buffer.from(await f.arrayBuffer()).toString("hex");
  const r = await sql`insert into media (filename, mime, size, data, created_by) values (${f.name.slice(0, 120)}, ${f.type}, ${f.size}, decode(${hex}, 'hex'), ${g.user.id}) returning id`;
  return json({ id: r[0].id, url: `/api/media/${r[0].id}` });
}
