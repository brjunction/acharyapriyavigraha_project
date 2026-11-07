import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { addToSection, LAYOUTS, COLORS } from "@/lib/video-home";
import { resolve, addVideo, videoId, sourceMeta, syncSource, apiKey, type Source } from "@/lib/youtube-sync";

export const maxDuration = 300;
const fresh = () => revalidatePath("/teachings/videos", "layout");
const slugify = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
const LAY = LAYOUTS.map(([k]) => k as string); const COL = COLORS as readonly string[];

/** Sections of the Videos page. ?id=… also returns that section's videos, in order. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const id = new URL(req.url).searchParams.get("id");
  const sections = await sql`select s.*, (select count(*)::int from video_section_items i where i.section_id = s.id and not i.removed) as videos from video_sections s order by position, created_at`;
  const sources = await sql`select id, name, url, kind, ref, avatar, section_id, new_on_top, last_synced_at from video_sources order by position, created_at`;
  if (!id) return json({ sections, sources });
  const items = await sql`select i.youtube_id, i.position, v.slug, v.title, v.duration_sec, v.status from video_section_items i left join videos v on v.youtube_id = i.youtube_id where i.section_id = ${id} and not i.removed order by i.position limit 3000`;
  return json({ sections, sources, items });
}

/**
 * { create: { name } } · { update: { id, name?, intro?, layout?, color?, on_home?, hidden? } } · { order: [ids] } · { remove: id }
 * { add: { id, links: [..], top? } } — video links are added; playlist and channel links feed the section from now on
 * { attach: { id, source } } / { detach: { source } } · { items: { id, ids: [youtube ids in order] } } — reorder
 * { move: { from, to, yt } } · { drop: { id, yt } } — remove from a section (stays removed after fetching)
 */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (b.create) {
    const name = String(b.create.name || "").trim(); if (!name) return fail("Give the section a name.");
    let slug = slugify(name); for (let i = 2; (await sql`select 1 from video_sections where slug = ${slug}`).length; i++) slug = `${slugify(name)}-${i}`;
    const row = (await sql`insert into video_sections (name, slug, layout, color, position) values (${name}, ${slug}, ${LAY.includes(b.create.layout) ? b.create.layout : "row"}, ${COL.includes(b.create.color) ? b.create.color : "saffron"}, (select coalesce(max(position), 0) + 1 from video_sections)) returning *`)[0];
    fresh(); return json(row);
  }
  if (b.update) {
    const u = b.update; const cur = (await sql`select * from video_sections where id = ${u.id}`)[0] as any; if (!cur) return fail("Not found.");
    await sql`update video_sections set name = ${String(u.name ?? cur.name).trim() || cur.name}, intro = ${"intro" in u ? u.intro || null : cur.intro}, layout = ${LAY.includes(u.layout) ? u.layout : cur.layout}, color = ${COL.includes(u.color) ? u.color : cur.color},
      on_home = ${"on_home" in u ? !!u.on_home : cur.on_home}, hidden = ${"hidden" in u ? !!u.hidden : cur.hidden} where id = ${u.id}`;
    fresh(); return json({ ok: true });
  }
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update video_sections set position = ${i} where id = ${id}`; fresh(); return json({ ok: true }); }
  if (b.remove) { await sql`delete from video_sections where id = ${b.remove}`; fresh(); return json({ ok: true }); }
  if (b.add) {
    const { id, top } = b.add; const out: { url: string; ok: boolean; note: string }[] = []; const ids: string[] = []; const key = await apiKey();
    for (const raw of (b.add.links || []).map((x: string) => String(x).trim()).filter(Boolean).slice(0, 300)) {
      try {
        const v = videoId(raw);
        if (v && !/[?&]list=/.test(raw)) { await addVideo(raw); ids.push(v); out.push({ url: raw, ok: true, note: "Video added" }); continue; }
        const r = await resolve(raw); const m = await sourceMeta({ kind: r.kind, ref: r.ref }, key);
        const src = (await sql`insert into video_sources (url, name, kind, ref, avatar, description, section_id, show_as, position) values (${raw}, ${r.name}, ${r.kind}, ${r.ref}, ${m.avatar}, ${m.description}, ${id}, ${r.kind === "channel" ? "channel" : "row"}, (select coalesce(max(position), 0) + 1 from video_sources))
          on conflict (url) do update set section_id = ${id}, ref = excluded.ref returning *`)[0] as Source;
        const res = await syncSource(src, key);
        out.push({ url: raw, ok: true, note: `${r.kind === "playlist" ? "Playlist" : "Channel"}${r.name ? ` “${r.name}”` : ""}: ${res.seen} videos${res.left ? ` (${res.left} more come with the next fetch)` : ""}` });
      } catch (e: any) { out.push({ url: raw, ok: false, note: e.message }); }
    }
    if (ids.length) await addToSection(id, ids, !!top);
    fresh(); return json({ results: out });
  }
  if (b.attach) { await sql`update video_sources set section_id = ${b.attach.id} where id = ${b.attach.source}`; const s = (await sql`select * from video_sources where id = ${b.attach.source}`)[0] as Source; try { await syncSource(s, await apiKey()); } catch {} fresh(); return json({ ok: true }); }
  if (b.detach) { await sql`update video_sources set section_id = null where id = ${b.detach.source}`; fresh(); return json({ ok: true }); }
  if (b.items) { const { id, ids } = b.items as { id: string; ids: string[] }; const pos = ids.map((_, i) => i); await sql`update video_section_items i set position = t.p from unnest(${ids}::text[], ${pos}::int[]) as t(y, p) where i.section_id = ${id} and i.youtube_id = t.y`; fresh(); return json({ ok: true }); }
  if (b.move) {
    const { from, to, yt } = b.move; if (from === to) return json({ ok: true });
    await sql`update video_section_items set removed = true where section_id = ${from} and youtube_id = ${yt}`;
    await sql`insert into video_section_items (section_id, youtube_id, position) values (${to}, ${yt}, (select coalesce(max(position), 0) + 1 from video_section_items where section_id = ${to})) on conflict (section_id, youtube_id) do update set removed = false, position = excluded.position`;
    fresh(); return json({ ok: true });
  }
  if (b.drop) { await sql`update video_section_items set removed = true where section_id = ${b.drop.id} and youtube_id = ${b.drop.yt}`; fresh(); return json({ ok: true }); }
  if (b.newOnTop) { await sql`update video_sources set new_on_top = ${!!b.newOnTop.on} where id = ${b.newOnTop.source}`; return json({ ok: true }); }
  return fail("Nothing to do.");
}
