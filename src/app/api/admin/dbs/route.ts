import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";

export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  return json(await sql`select d.id, d.slug, d.name, d.icon, d.fields, d.public, (select count(*)::int from db_rows r where r.db_id = d.id) as rows from dbs d order by d.name`);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); const name = String(b.name || "").trim(); if (!name) return fail("Give the database a name.");
  let slug = slugify(name), n = 1; while ((await sql`select 1 from dbs where slug = ${slug}`).length) slug = `${slugify(name)}-${++n}`;
  const fields = b.fields || [{ key: "text", label: "Details", type: "text" }];
  const r = await sql`insert into dbs (slug, name, fields) values (${slug}, ${name}, ${JSON.stringify(fields)}::jsonb) returning id, slug`; return json(r[0]);
}
