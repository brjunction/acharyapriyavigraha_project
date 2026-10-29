import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { VIDEO, insertRow, cleanBy } from "@/lib/content/generic";
import { revalidatePath } from "next/cache";

/** { ids, set } | { ids, delete } | { import: [...] } | { youtube: channelId, kind } */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (b.youtube) {
    const m = /(UC[\w-]{22})/.exec(String(b.youtube)); if (!m) return fail("Paste the channel ID (starts with UC…).");
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}`); if (!r.ok) return fail("YouTube did not answer. Check the channel ID.");
    const xml = await r.text(); const channel = (/<author>\s*<name>([^<]+)</.exec(xml)?.[1] || "").replace(/&amp;/g, "&");
    const items = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((e) => ({ youtube_id: /<yt:videoId>([^<]+)</.exec(e[1])?.[1] || "", title: (/<title>([^<]*)</.exec(e[1])?.[1] || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), date: (/<published>([^<]+)</.exec(e[1])?.[1] || "").slice(0, 10), description: (/<media:description>([^<]*)</.exec(e[1])?.[1] || "").slice(0, 2000) })).filter((v) => v.youtube_id);
    const have = new Set((await sql`select youtube_id from videos where youtube_id = any(${items.map((i) => i.youtube_id)})`).map((x) => x.youtube_id as string));
    let added = 0; for (const it of items) if (!have.has(it.youtube_id)) { await insertRow(VIDEO, { ...it, channel, kind: b.kind || "lecture" }); added++; }
    revalidatePath("/teachings/videos"); return json({ added, seen: items.length, channel });
  }
  if (Array.isArray(b.import)) { let added = 0; for (const x of b.import.slice(0, 500)) if (x.title) { await insertRow(VIDEO, x); added++; } revalidatePath("/teachings/videos"); return json({ added }); }
  const ids: string[] = b.ids || []; if (!ids.length) return fail("Choose some videos first.");
  if (b.delete) await sql`delete from videos where id = any(${ids})`;
  if (b.set) { const a = cleanBy(VIDEO, b.set); const sets: string[] = []; const vals: any[] = []; for (const [k, v] of Object.entries(a)) { vals.push(v); sets.push(`${k} = $${vals.length}`); } if (sets.length) { vals.push(ids); await sql.query(`update videos set ${sets.join(", ")} where id = any($${vals.length})`, vals); } }
  revalidatePath("/teachings/videos"); return json({ ok: true });
}
