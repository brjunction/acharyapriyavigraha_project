import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { LIBRARY } from "@/lib/cms/library-defs";

/** Lists the Library collections, creating any that do not exist yet and adding missing system columns. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const have = await sql`select id, slug, fields, views, settings, (select count(*)::int from db_rows r where r.db_id = d.id) as rows from dbs d where slug = any(${LIBRARY.map((l) => l.slug)})`;
  const ids: Record<string, string> = {}; for (const r of await sql`select id, slug from dbs where slug = any(${LIBRARY.map((l) => l.slug)})`) ids[r.slug as string] = r.id as string;
  const out = [];
  for (const def of LIBRARY) {
    let d: any = have.find((x: any) => x.slug === def.slug);
    const fields = def.fields.map((f) => (f.relation ? { ...f, relation: ids[f.relation] || "" } : f));
    if (!d) {
      if (g.user.role === "viewer" || g.user.role === "contributor") continue;
      d = (await sql`insert into dbs (slug, name, fields, views, settings, public) values (${def.slug}, ${def.name}, ${JSON.stringify(fields)}::jsonb, ${JSON.stringify(def.views)}::jsonb, ${JSON.stringify({ icon: def.icon, description: def.description, system: true })}::jsonb, true) on conflict (slug) do nothing returning id, slug`)[0];
      if (!d) continue; ids[def.slug] = d.id; d.rows = 0;
    } else {
      const cur: any[] = d.fields || []; let changed = !d.settings?.system;
      const merged = cur.map((c) => { const s = fields.find((x) => x.key === c.key); if (!s) return c; if (!c.system || (s.relation && !c.relation)) changed = true; return { ...c, system: true, type: c.type === s.type ? c.type : s.type, relation: c.relation || s.relation }; });
      for (const s of fields) if (!cur.some((c) => c.key === s.key)) { merged.push(s); changed = true; }
      if (changed) await sql`update dbs set fields = ${JSON.stringify(merged)}::jsonb, settings = ${JSON.stringify({ ...d.settings, system: true, icon: d.settings?.icon || def.icon })}::jsonb where id = ${d.id}`;
    }
    out.push({ id: d.id, slug: def.slug, name: def.name, icon: def.icon, group: def.group, route: def.route, rows: d.rows });
  }
  return json(out);
}
