import { revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { TATTVA } from "@/lib/data";

const TABLES = ["excerpts", "audios", "videos", "articles"] as const;
type T = (typeof TABLES)[number];
const fresh = () => { try { revalidateTag("topics", "max"); } catch {} };
const isT = (t: unknown): t is T => TABLES.includes(t as T);

/** Topics with counts; ?items=<name> lists what is linked to one; ?find=<words>&table= searches things to link. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url); const items = u.searchParams.get("items"); const find = u.searchParams.get("find"); const table = u.searchParams.get("table");
  if (items !== null) {
    const [e, a, v, r] = await Promise.all([
      sql`select id, 'excerpts' as t, kind, coalesce(nullif(title,''), left(text, 140)) as label from excerpts where ${items} = any(topics) order by kind, position limit 500`,
      sql`select id, 'audios' as t, kind, title as label, date from audios where ${items} = any(topics) order by date desc nulls last limit 500`,
      sql`select id, 'videos' as t, 'video' as kind, title as label, date from videos where ${items} = any(topics) order by date desc nulls last limit 500`,
      sql`select id, 'articles' as t, 'article' as kind, title as label from articles where ${items} = any(topics) limit 500`,
    ]);
    return json([...e, ...a, ...v, ...r]);
  }
  if (find !== null && isT(table)) {
    const w = `%${find.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()}%`;
    const label = table === "excerpts" ? "coalesce(nullif(title,''), left(text, 140))" : "title";
    const kind = table === "excerpts" || table === "audios" ? "kind" : table === "videos" ? "'video'" : "'article'";
    return json(await sql.query(`select id, '${table}' as t, ${kind} as kind, ${label} as label, topics from ${table} where search like $1 order by ${table === "excerpts" || table === "articles" ? "created_at desc" : "date desc nulls last"} limit 40`, [w]));
  }
  const [v, ...counts] = await Promise.all([
    sql`select name, extra from vocab where kind = 'topic'`,
    ...TABLES.map((t) => sql.query(`select x as name, count(*)::int n from (select unnest(topics) x from ${t}) s group by 1`)),
  ]);
  const by: Record<string, { name: string; parent: string | null; description: string; counts: Record<string, number> }> = {};
  for (const r of v as any[]) by[r.name] = { name: r.name, parent: r.extra?.parent || null, description: r.extra?.description || "", counts: {} };
  TABLES.forEach((t, i) => (counts[i] as any[]).forEach((r) => { (by[r.name] ||= { name: r.name, parent: null, description: "", counts: {} }).counts[t] = r.n; }));
  return json(Object.values(by).sort((a, b) => a.name.localeCompare(b.name)));
}

/** Add a topic; {seed:true} adds a starter tree; {link:{t,id,name,on}} links or unlinks one thing. */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (b.seed) { for (const t of TATTVA) { await sql`insert into vocab (kind, name, extra) values ('topic', ${t.name}, '{}'::jsonb) on conflict (kind, name) do nothing`; for (const c of t.children) await sql`insert into vocab (kind, name, extra) values ('topic', ${c}, ${JSON.stringify({ parent: t.name })}::jsonb) on conflict (kind, name) do nothing`; } fresh(); return json({ ok: true }); }
  if (b.link) {
    const { t, id, name, on } = b.link; if (!isT(t) || !id || !name) return fail("Missing details.");
    if (on) await sql.query(`update ${t} set topics = array_append(coalesce(topics, '{}'), $2) where id = $1 and not ($2 = any(coalesce(topics, '{}')))`, [id, name]);
    else await sql.query(`update ${t} set topics = array_remove(topics, $2) where id = $1`, [id, name]);
    await sql`insert into vocab (kind, name, extra) values ('topic', ${name}, '{}'::jsonb) on conflict do nothing`; fresh(); return json({ ok: true });
  }
  const name = String(b.name || "").trim(); if (!name) return fail("Please type a name.");
  await sql`insert into vocab (kind, name, extra) values ('topic', ${name}, ${JSON.stringify({ parent: b.parent || null, description: b.description || "" })}::jsonb) on conflict (kind, name) do update set extra = vocab.extra || excluded.extra`;
  fresh(); return json({ ok: true });
}

/** Rename (everywhere), move under another topic, or change the description. */
export async function PATCH(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  const name = String(b.name || ""); if (!name) return fail("Missing name.");
  const cur = ((await sql`select extra from vocab where kind = 'topic' and name = ${name}`)[0]?.extra || {}) as any;
  const extra = { ...cur, ...(b.parent !== undefined ? { parent: b.parent || null } : {}), ...(b.description !== undefined ? { description: b.description } : {}) };
  if (extra.parent === name) return fail("A topic cannot be inside itself.");
  const to = String(b.to || "").trim();
  if (to && to !== name) {
    for (const t of TABLES) await sql.query(`update ${t} set topics = array_remove(array_replace(topics, $1, $2), null) where $1 = any(topics)`, [name, to]);
    await sql`delete from vocab where kind = 'topic' and name = ${name}`;
    await sql`insert into vocab (kind, name, extra) values ('topic', ${to}, ${JSON.stringify(extra)}::jsonb) on conflict (kind, name) do update set extra = excluded.extra`;
    await sql`update vocab set extra = jsonb_set(extra, '{parent}', to_jsonb(${to}::text)) where kind = 'topic' and extra->>'parent' = ${name}`;
  } else await sql`insert into vocab (kind, name, extra) values ('topic', ${name}, ${JSON.stringify(extra)}::jsonb) on conflict (kind, name) do update set extra = excluded.extra`;
  fresh(); return json({ ok: true });
}

/** Remove a topic. Things linked to it keep everything else; topics inside it move up one level. */
export async function DELETE(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); const name = String(b.name || ""); if (!name) return fail("Missing name.");
  const parent = ((await sql`select extra->>'parent' p from vocab where kind = 'topic' and name = ${name}`)[0] as any)?.p || null;
  await sql`update vocab set extra = jsonb_set(extra, '{parent}', ${JSON.stringify(parent)}::jsonb) where kind = 'topic' and extra->>'parent' = ${name}`;
  for (const t of TABLES) await sql.query(`update ${t} set topics = array_remove(topics, $1) where $1 = any(topics)`, [name]);
  await sql`delete from vocab where kind = 'topic' and name = ${name}`; fresh(); return json({ ok: true });
}
