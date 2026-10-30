import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

/** Create or update a chapter. */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  const from = Number(b.year_from), to = Number(b.year_to) || from; if (!String(b.title || "").trim() || !from) return fail("A chapter needs a name and its first year.");
  if (to < from) return fail("The last year cannot be before the first.");
  const v = [String(b.title).trim(), b.subtitle || null, from, to, b.summary || null, b.image || null, Number(b.position) || 0];
  const r = b.id ? await sql`update life_eras set title = ${v[0]}, subtitle = ${v[1]}, year_from = ${v[2]}, year_to = ${v[3]}, summary = ${v[4]}, image = ${v[5]}, position = ${v[6]}, updated_at = now() where id = ${b.id} returning id`
    : await sql`insert into life_eras (title, subtitle, year_from, year_to, summary, image, position) values (${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, ${v[4]}, ${v[5]}, ${v[6]}) returning id`;
  revalidatePath("/gurudeva/timeline"); return json(r[0]);
}
export async function DELETE(req: Request) { const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); await sql`delete from life_eras where id = ${b.id}`; revalidatePath("/gurudeva/timeline"); return json({ ok: true }); }
