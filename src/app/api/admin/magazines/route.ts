import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function GET() { const g = await guard("viewer"); if ("res" in g) return g.res; return json(await sql`select * from magazines order by position, title`); }
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update magazines set position = ${i} where id = ${id}`; revalidatePath("/teachings/magazines"); return json({ ok: true }); }
  if (!String(b.title || "").trim()) return fail("Give the magazine a name.");
  const n = Number((await sql`select coalesce(max(position), 0) + 1 as n from magazines`)[0].n);
  const r = await sql`insert into magazines (title, publisher, description, cover, url, issues, status, position) values (${b.title.trim()}, ${b.publisher || null}, ${b.description || null}, ${b.cover || null}, ${b.url || null}, ${JSON.stringify(b.issues || [])}::jsonb, ${b.status || "published"}, ${n}) returning id`;
  revalidatePath("/teachings/magazines"); return json(r[0]);
}
