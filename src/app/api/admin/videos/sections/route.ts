import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { freshSite } from "@/lib/fresh";
import { addToSection, LAYOUTS, COLORS, ensureDefaultSections, feedKinds, KIND_SECTIONS } from "@/lib/video-home";
import { resolve, addVideo, videoId, sourceMeta, apiKey } from "@/lib/youtube-sync";

export const maxDuration = 120;
/** Publishing shows at once: the Videos pages and the home page are rebuilt on the next visit. */
const fresh = freshSite;
const slugify = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
const LAY = LAYOUTS.map(([k]) => k as string); const COL = COLORS as readonly string[];

/** Sections of the Videos page. ?id=… also returns that section's videos, in order. */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const id = new URL(req.url).searchParams.get("id");
  await ensureDefaultSections().catch(() => {});
  const sections = await sql`select s.*, (select count(*)::int from video_section_items i where i.section_id = s.id and not i.removed) as videos from video_sections s order by position, created_at`;
  const sources = await sql`select id, name, url, kind, ref, avatar, section_id, new_on_top, last_synced_at, sync_state, sync_error, (select count(*)::int from video_source_items i where i.source_id = video_sources.id) as videos from video_sources order by position, created_at`;
  if (!id) return json({ sections, sources });
  const items = await sql`select i.youtube_id, i.position, v.slug, v.title, v.duration_sec, v.status, v.kind from video_section_items i left join lateral (select * from videos v where v.youtube_id = i.youtube_id order by created_at limit 1) v on true where i.section_id = ${id} and not i.removed order by i.position limit 3000`;
  return json({ sections, sources, items, kinds: KIND_SECTIONS });
}

/**
 * { create: { name } } · { update: { id, name?, intro?, layout?, color?, on_home?, hidden? } } · { order: [ids] } · { remove: id }
 * { add: { id, links: [..], top? } } — video links are added; playlist and channel links feed the section from now on
 * { attach: { id, source } } / { detach: { source } } · { items: { id, ids: [youtube ids in order] } } — reorder
 * { move: { from, to, yt } } · { drop: { id, yt } } — remove from a section (stays removed after fetching)
 */
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  /** Publish: everything arranged in the Studio, sent in one go. */
  if (b.publish) {
    const P = b.publish as { sections: any[]; deleted: string[]; items: Record<string, string[]>; adds: Record<string, string[]> };
    for (const id of P.deleted || []) await sql`delete from video_sections where id = ${id}`;
    const fed: string[] = [];
    // where each section sits: a parent that exists, never itself or one of its own sub-sections
    const par = new Map<string, string | null>((P.sections || []).map((x: any) => [x.id, x.parent_id || null]));
    const ok = (id: string) => { const seen = new Set([id]); for (let p = par.get(id); p; p = par.get(p) ?? null) { if (seen.has(p) || !par.has(p)) return false; seen.add(p); } return true; };
    for (const x of P.sections || []) {
      const cur = (await sql`select kinds from video_sections where id = ${x.id}`)[0] as any; if (!cur) continue;
      const kinds = Array.isArray(x.kinds) ? x.kinds.map(String) : cur.kinds;
      await sql`update video_sections set name = ${String(x.name || "").trim() || "Section"}, intro = ${x.intro || null}, layout = ${LAY.includes(x.layout) ? x.layout : "row"}, color = ${COL.includes(x.color) ? x.color : "saffron"}, on_home = ${!!x.on_home}, on_tabs = ${x.on_tabs !== false}, hidden = ${!!x.hidden}, kinds = ${kinds}, position = ${Number(x.position) || 0}, parent_id = ${x.parent_id && ok(x.id) ? x.parent_id : null}, fold = ${["none", "open", "closed"].includes(x.fold) ? x.fold : "none"} where id = ${x.id}`;
      if (JSON.stringify([...(cur.kinds || [])].sort()) !== JSON.stringify([...kinds].sort())) fed.push(x.id);
    }
    for (const [id, yts] of Object.entries(P.items || {})) {
      const pos = yts.map((_, i) => i);
      await sql`update video_section_items set removed = true where section_id = ${id} and not (youtube_id = any(${yts}::text[]))`;
      await sql`insert into video_section_items (section_id, youtube_id, position, removed) select ${id}::uuid, y, p, false from unnest(${yts}::text[], ${pos}::int[]) as t(y, p) on conflict (section_id, youtube_id) do update set position = excluded.position, removed = false`;
    }
    for (const [id, yts] of Object.entries(P.adds || {})) { if (P.items?.[id]) continue; await sql`update video_section_items set removed = false where section_id = ${id} and youtube_id = any(${yts}::text[])`; await addToSection(id, yts, false); }
    for (const id of fed) await feedKinds(id);
    fresh(); return json({ ok: true });
  }
  if (b.create) {
    const name = String(b.create.name || "").trim(); if (!name) return fail("Give the section a name.");
    let slug = slugify(name); for (let i = 2; (await sql`select 1 from video_sections where slug = ${slug}`).length; i++) slug = `${slugify(name)}-${i}`;
    const parent = b.create.parent_id && (await sql`select 1 from video_sections where id = ${b.create.parent_id}`).length ? b.create.parent_id : null;
    const row = (await sql`insert into video_sections (name, slug, layout, color, position, parent_id, on_tabs) values (${name}, ${slug}, ${LAY.includes(b.create.layout) ? b.create.layout : "row"}, ${COL.includes(b.create.color) ? b.create.color : "saffron"}, (select coalesce(max(position), 0) + 1 from video_sections), ${parent}, ${!parent}) returning *`)[0];
    fresh(); return json(row);
  }
  if (b.update) {
    const u = b.update; const cur = (await sql`select * from video_sections where id = ${u.id}`)[0] as any; if (!cur) return fail("Not found.");
    await sql`update video_sections set name = ${String(u.name ?? cur.name).trim() || cur.name}, intro = ${"intro" in u ? u.intro || null : cur.intro}, layout = ${LAY.includes(u.layout) ? u.layout : cur.layout}, color = ${COL.includes(u.color) ? u.color : cur.color},
      on_home = ${"on_home" in u ? !!u.on_home : cur.on_home}, on_tabs = ${"on_tabs" in u ? !!u.on_tabs : cur.on_tabs}, hidden = ${"hidden" in u ? !!u.hidden : cur.hidden}, kinds = ${Array.isArray(u.kinds) ? u.kinds.map(String) : cur.kinds} where id = ${u.id}`;
    if (Array.isArray(u.kinds)) await feedKinds(u.id);
    fresh(); return json({ ok: true });
  }
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update video_sections set position = ${i} where id = ${id}`; fresh(); return json({ ok: true }); }
  if (b.remove) { await sql`delete from video_sections where id = ${b.remove}`; fresh(); return json({ ok: true }); }
  if (b.add) {
    // Video links are added at once; playlist and channel links are registered here and fetched step by step by the Studio.
    const { id, top } = b.add; const out: { url: string; ok: boolean; note: string; source?: string }[] = []; const ids: string[] = []; const key = await apiKey();
    for (const raw of (b.add.links || []).map((x: string) => String(x).trim()).filter(Boolean).slice(0, 300)) {
      try {
        const v = videoId(raw);
        if (v && !/[?&]list=/.test(raw)) { await addVideo(raw); ids.push(v); out.push({ url: raw, ok: true, note: "Video added" }); continue; }
        const r = await resolve(raw); const dup = (await sql`select id from video_sources where ref = ${r.ref}`)[0] as any;
        let sid = dup?.id as string | undefined;
        if (dup) await sql`update video_sources set section_id = ${id} where id = ${dup.id}`;
        else { const m = await sourceMeta({ kind: r.kind, ref: r.ref }, key); sid = ((await sql`insert into video_sources (url, name, kind, ref, avatar, description, section_id, show_as, position) values (${raw}, ${r.name}, ${r.kind}, ${r.ref}, ${m.avatar}, ${m.description}, ${id}, ${r.kind === "channel" ? "channel" : "row"}, (select coalesce(max(position), 0) + 1 from video_sources)) on conflict (url) do update set section_id = ${id}, ref = excluded.ref returning id`)[0] as any).id; }
        out.push({ url: raw, ok: true, note: `${r.kind === "playlist" ? "Playlist" : "Channel"}${r.name ? ` “${r.name}”` : ""} ${dup ? "is already here — linked to this section" : "added"}`, source: sid });
      } catch (e: any) { out.push({ url: raw, ok: false, note: e?.name === "TimeoutError" ? "YouTube was slow to answer — try this link again." : e.message }); }
    }
    if (ids.length) await addToSection(id, ids, !!top);
    fresh(); return json({ results: out });
  }
  if (b.attach) { await sql`update video_sources set section_id = ${b.attach.id} where id = ${b.attach.source}`; const sec = (await sql`select layout from video_sections where id = ${b.attach.id}`)[0] as any; if (sec && !["playlists", "channels", "folder", "tabs"].includes(sec.layout)) { const yts = ((await sql`select youtube_id from video_source_items where source_id = ${b.attach.source} order by position`) as any[]).map((r) => r.youtube_id); await addToSection(b.attach.id, yts, false); } fresh(); return json({ ok: true, source: b.attach.source }); }
  if (b.detach) {
    const src = (await sql`select section_id from video_sources where id = ${b.detach.source}`)[0] as any;
    if (b.detach.purge && src?.section_id) await sql`update video_section_items set removed = true where section_id = ${src.section_id} and youtube_id in (select youtube_id from video_source_items where source_id = ${b.detach.source})`;
    await sql`update video_sources set section_id = null where id = ${b.detach.source}`; fresh(); return json({ ok: true });
  }
  /** Many videos at once: { bulk: { id, yts, op: "top" | "bottom" | "drop" | "move" | "copy", to? } } */
  if (b.bulk) {
    const { id, yts, op, to } = b.bulk as { id: string; yts: string[]; op: string; to?: string }; if (!yts?.length) return json({ ok: true });
    if (op === "drop" || op === "move") await sql`update video_section_items set removed = true where section_id = ${id} and youtube_id = any(${yts}::text[])`;
    if ((op === "move" || op === "copy") && to) { await sql`update video_section_items set removed = false where section_id = ${to} and youtube_id = any(${yts}::text[])`; await addToSection(to, yts, false); }
    if (op === "top" || op === "bottom") {
      const e = (await sql`select coalesce(min(position), 0) as lo, coalesce(max(position), 0) as hi from video_section_items where section_id = ${id}`)[0] as any;
      const pos = yts.map((_, i) => (op === "top" ? e.lo - yts.length + i : e.hi + 1 + i));
      await sql`update video_section_items i set position = t.p from unnest(${yts}::text[], ${pos}::int[]) as t(y, p) where i.section_id = ${id} and i.youtube_id = t.y`;
    }
    fresh(); return json({ ok: true });
  }
  /** From All videos: { addTo: { to, ids: [video ids] } } */
  if (b.addTo) { const rows = (await sql`select youtube_id from videos where id = any(${b.addTo.ids}::uuid[]) and youtube_id is not null`) as any[]; const yts = rows.map((r) => r.youtube_id); await sql`update video_section_items set removed = false where section_id = ${b.addTo.to} and youtube_id = any(${yts}::text[])`; const n = await addToSection(b.addTo.to, yts, false); fresh(); return json({ added: n }); }
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
