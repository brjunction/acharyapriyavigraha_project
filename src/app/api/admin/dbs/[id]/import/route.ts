import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";

/** Adds many records at once (from a spreadsheet). Body: { rows: { title, data }[] } — up to 500 per request. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const rows: { title: string; data: Record<string, any> }[] = Array.isArray(b.rows) ? b.rows.slice(0, 500) : [];
  if (!rows.length) return fail("Nothing to import.");
  const taken = new Set((await sql`select slug from db_rows where db_id = ${id}`).map((r) => r.slug as string));
  const out = rows.map((r) => { const t = String(r.title || "Untitled").slice(0, 300); const base = slugify(t) || "untitled"; let s = base, n = 1; while (taken.has(s)) s = `${base}-${++n}`; taken.add(s); return { slug: s, title: t, data: r.data || {} }; });
  await sql`insert into db_rows (db_id, slug, title, data, status) select ${id}, x.slug, x.title, x.data, 'published' from jsonb_to_recordset(${JSON.stringify(out)}::jsonb) as x(slug text, title text, data jsonb)`;
  return json({ added: out.length });
}
