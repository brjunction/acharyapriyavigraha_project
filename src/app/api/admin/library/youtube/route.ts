import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";

/** Brings the newest videos of a YouTube channel into the Videos collection (skips ones already there). */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json(); const ch = String(b.channel || "").trim();
  const m = /(UC[\w-]{22})/.exec(ch); if (!m) return fail("Paste the channel ID (it starts with UC…). On YouTube: the channel page → About → Share → Copy channel ID.");
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}`); if (!r.ok) return fail("YouTube did not answer. Check the channel ID.");
  const xml = await r.text(); const name = (/<author>\s*<name>([^<]+)</.exec(xml)?.[1] || "").replace(/&amp;/g, "&");
  const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((e) => ({ id: /<yt:videoId>([^<]+)</.exec(e[1])?.[1] || "", title: (/<title>([^<]*)</.exec(e[1])?.[1] || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), date: (/<published>([^<]+)</.exec(e[1])?.[1] || "").slice(0, 10) })).filter((v) => v.id);
  const db = (await sql`select id from dbs where slug = 'videos'`)[0]; if (!db) return fail("Open the Videos collection once first.");
  const have = new Set((await sql`select data->>'video' as v from db_rows where db_id = ${db.id}`).map((x) => String(x.v || "")));
  const taken = new Set((await sql`select slug from db_rows where db_id = ${db.id}`).map((x) => x.slug as string));
  const fresh = items.filter((v) => ![...have].some((h) => h.includes(v.id))).map((v) => { const base = slugify(v.title) || v.id; let s = base, n = 1; while (taken.has(s)) s = `${base}-${++n}`; taken.add(s); return { slug: s, title: v.title, data: { video: `https://www.youtube.com/watch?v=${v.id}`, date: v.date, channel: name } }; });
  if (fresh.length) await sql`insert into db_rows (db_id, slug, title, data, status) select ${db.id}, x.slug, x.title, x.data, 'published' from jsonb_to_recordset(${JSON.stringify(fresh)}::jsonb) as x(slug text, title text, data jsonb)`;
  return json({ added: fresh.length, seen: items.length, channel: name });
}
