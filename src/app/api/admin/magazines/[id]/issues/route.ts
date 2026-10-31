import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/content/text";

/** Add an issue to a magazine — or many at once with {many: [{number, title, date, cover, pdf_url}]}. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const list: any[] = Array.isArray(b.many) ? b.many : [b]; const out: any[] = [];
  for (const x of list) {
    const label = String(x.number || x.title || "issue").trim(); let slug = slugify(label), k = 1; const base = slug;
    while ((await sql`select 1 from magazine_issues where magazine_id = ${id} and slug = ${slug}`).length) slug = `${base}-${++k}`;
    const day = x.date ? String(x.date).slice(0, 10) : null; const year = x.year ? Number(x.year) : day ? Number(day.slice(0, 4)) : null;
    const n = Number((await sql`select coalesce(max(position), 0) + 1 as n from magazine_issues where magazine_id = ${id}`)[0].n);
    out.push((await sql`insert into magazine_issues (magazine_id, slug, number, title, date, year, cover, pdf_url, url, description, position, status) values (${id}, ${slug}, ${x.number || null}, ${x.title || null}, ${day}, ${year}, ${x.cover || null}, ${x.pdf_url || null}, ${x.url || null}, ${x.description || null}, ${n}, ${x.status || "published"}) returning id, slug`)[0]);
  }
  revalidatePath("/teachings/magazines", "layout"); return json(Array.isArray(b.many) ? out : out[0]);
}
