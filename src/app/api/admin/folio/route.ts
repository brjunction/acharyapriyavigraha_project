import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { sections } from "@/lib/folio";
import { revalidatePath } from "next/cache";
export async function GET() { const g = await guard("viewer"); if ("res" in g) return g.res; return json(await sections(true)); }
export async function PUT(req: Request) {
  const g = await guard("admin"); if ("res" in g) return g.res; const b = await req.json(); const list = Array.isArray(b.sections) ? b.sections : [];
  await sql`delete from folio_sections`;
  for (const [i, s] of list.entries()) await sql`insert into folio_sections (title, source, enabled, position) values (${String(s.title || "").slice(0, 120)}, ${String(s.source)}, ${!!s.enabled}, ${i})`;
  revalidatePath("/webfolio"); return json({ ok: true });
}
