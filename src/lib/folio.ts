/* WebFolio: the whole archive as one document with a tree, built from the same data as the website. */
import { sql, hasDb } from "@/lib/db";
import { getMenus } from "@/lib/menus-server";
import { fold, verseRef, durText } from "@/lib/content/text";
import { docText } from "@/components/cms/doc-text";
import { order } from "@/lib/content/books";

import { SOURCES, DEFAULT_SECTIONS, type FSection } from "./folio-sources";
export { SOURCES, DEFAULT_SECTIONS, type FSection };
export async function sections(all = false): Promise<FSection[]> {
  if (!hasDb()) return DEFAULT_SECTIONS;
  try { const r = (await sql`select id, title, source, enabled, position from folio_sections order by position`) as FSection[]; const s = r.length ? r : DEFAULT_SECTIONS; return all ? s : s.filter((x) => x.enabled); } catch { return DEFAULT_SECTIONS; }
}

export type TNode = { id: string; title: string; sub?: string; leaf?: boolean; count?: number };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EXK: [string, string][] = [["quote", "Quotes"], ["verse", "Verses"], ["story", "Stories & anecdotes"], ["instruction", "Instructions"], ["desire", "Desires"], ["nectar", "Nectar drops"], ["analogy", "Analogies"], ["qa", "Questions & answers"], ["memory", "Memories"], ["glorification", "Glorifications"]];
const VK: Record<string, string> = { lecture: "Lectures", kirtan: "Kīrtanas", "daily-diary": "Daily diary", festival: "Festivals", documentary: "Documentaries", memory: "Memories", other: "Other" };
const songs = (s: string) => s === "kirtans";

/** Children of a tree node. Node ids: “sec:<source>”, “ay:<src>:<year>”, “am:<src>:<year>:<m>”, “a:<slug>”, “book:<id>”, “bn:<id>”, “exk:<kind>”, “ex:<slug>”, “vk:<kind>”, “v:<slug>”, “mg:<menu>:<i>”, “p:<path>”. */
export async function children(id: string): Promise<TNode[]> {
  if (!hasDb()) return [];
  const [t, a, b, c] = id.split(":");
  if (t === "sec") {
    const src = id.slice(4);
    if (src.startsWith("menu:")) { const m = (await getMenus()).find((x) => x.key === src.slice(5)); return (m?.groups || []).map((g, i) => ({ id: `mg:${src.slice(5)}:${i}`, title: g.title, count: g.links.length })); }
    if (src === "audios" || src === "transcripts" || src === "kirtans") return (await sql`select coalesce(extract(year from date)::int, 0) as y, count(*)::int as n from audios where status = 'published' and (kind in ('kirtan','bhajan')) = ${songs(src)} and (${src} <> 'transcripts' or jsonb_array_length(transcript) > 0) group by 1 order by 1`).map((r: any) => ({ id: `ay:${src}:${r.y}`, title: r.y ? String(r.y) : "Date unknown", count: r.n }));
    if (src === "videos") return (await sql`select kind, count(*)::int as n from videos where status = 'published' group by 1 order by 1`).map((r: any) => ({ id: `vk:${r.kind}`, title: VK[r.kind] || r.kind, count: r.n }));
    if (src === "books") return (await sql`select id, title, (select count(*)::int from book_nodes n where n.book_id = b.id and n.status = 'published') as n from books b where status = 'published' order by category nulls last, position, title`).map((r: any) => ({ id: `book:${r.id}`, title: r.title, count: r.n }));
    if (src === "excerpts") { const counts = Object.fromEntries((await sql`select kind, count(*)::int as n from excerpts where status = 'published' group by 1`).map((r: any) => [r.kind, r.n])); return EXK.filter(([k]) => counts[k]).map(([k, l]) => ({ id: `exk:${k}`, title: l, count: counts[k] })); }
    if (src === "pages") { const menuPaths = new Set((await getMenus()).flatMap((m) => m.groups.flatMap((g) => g.links.map((l) => l.href)))); return (await sql`select path, title from pages where status = 'published' and parent_id is null order by position, title`).filter((p: any) => !menuPaths.has(p.path)).map((p: any) => ({ id: `p:${p.path}`, title: p.title })); }
  }
  if (t === "ay") {
    const y = Number(b); const rows = await sql`select coalesce(extract(month from date)::int, 0) as m, count(*)::int as n from audios where status = 'published' and (kind in ('kirtan','bhajan')) = ${songs(a)} and (${a} <> 'transcripts' or jsonb_array_length(transcript) > 0) and coalesce(extract(year from date)::int, 0) = ${y} group by 1 order by 1`;
    if (rows.length === 1 || !y) return audiosIn(a, y, null);
    return rows.map((r: any) => ({ id: `am:${a}:${y}:${r.m}`, title: r.m ? MONTHS[r.m - 1] : "Month unknown", count: r.n }));
  }
  if (t === "am") return audiosIn(a, Number(b), Number(c));
  if (t === "book" || t === "bn") {
    const bookId = t === "book" ? a : ((await sql`select book_id from book_nodes where id = ${a}`)[0]?.book_id as string);
    return (await sql`select id, title, (select count(*)::int from book_nodes k where k.parent_id = n.id and k.status = 'published') as k from book_nodes n where book_id = ${bookId} and status = 'published' and parent_id is not distinct from ${t === "book" ? null : a} order by position`).map((r: any) => ({ id: `bn:${r.id}`, title: r.title, leaf: !r.k, count: r.k || undefined }));
  }
  if (t === "exk") return (await sql`select slug, title, text, verse_ref from excerpts where status = 'published' and kind = ${a} order by position, created_at limit 2000`).map((r: any) => ({ id: `ex:${r.slug}`, title: r.title || r.verse_ref || String(r.text).slice(0, 70) + (String(r.text).length > 70 ? "…" : ""), leaf: true }));
  if (t === "vk") return (await sql`select slug, title, date from videos where status = 'published' and kind = ${a} order by date desc nulls last limit 2000`).map((r: any) => ({ id: `v:${r.slug}`, title: r.title, sub: r.date ? String(r.date).slice(0, 10) : undefined, leaf: true }));
  if (t === "mg") { const m = (await getMenus()).find((x) => x.key === a); const g = m?.groups[Number(b)]; return (g?.links || []).filter((l) => l.href.startsWith("/")).map((l) => ({ id: `p:${l.href}`, title: l.label, sub: l.desc })); }
  if (t === "p") { const path = id.slice(2); return (await sql`select c.path, c.title from pages c join pages p on c.parent_id = p.id where p.path = ${path} and c.status = 'published' order by c.position, c.title`).map((r: any) => ({ id: `p:${r.path}`, title: r.title })); }
  return [];
}
async function audiosIn(src: string, y: number, m: number | null): Promise<TNode[]> {
  return (await sql`select slug, title, date, place, scripture, canto, chapter, verse from audios where status = 'published' and (kind in ('kirtan','bhajan')) = ${songs(src)} and (${src} <> 'transcripts' or jsonb_array_length(transcript) > 0)
    and coalesce(extract(year from date)::int, 0) = ${y} and (${m}::int is null or coalesce(extract(month from date)::int, 0) = ${m}) order by date nulls last, title`)
    .map((r: any) => ({ id: `a:${r.slug}`, title: r.title, sub: [r.date ? String(r.date).slice(0, 10) : "", r.place, verseRef(r)].filter(Boolean).join(" · "), leaf: true }));
}

/** Search everything. Words without diacritics match words with them. */
export async function search(q: string) {
  const f = fold(q); if (f.length < 2 || !hasDb()) return { total: 0, groups: [] as { title: string; hits: { id: string; title: string; sub: string; snippet: string }[] }[] };
  const like = `%${f}%`;
  const snip = (text: string) => { const t = text.replace(/\s+/g, " "); const ft = fold(t); const i = ft.indexOf(f); if (i < 0) return t.slice(0, 160); const s = Math.max(0, i - 70); return (s ? "…" : "") + t.slice(s, i + f.length + 90) + "…"; };
  const [aud, ex, bn, vid, pg] = await Promise.all([
    sql`select slug, title, date, place, kind, transcript, summary from audios where status = 'published' and search like ${like} order by date limit 80`,
    sql`select slug, kind, title, text, verse_ref, translation, source from excerpts where status = 'published' and search like ${like} limit 80`,
    sql`select n.id, n.title, n.blocks, b.title as book from book_nodes n join books b on b.id = n.book_id where n.status = 'published' and b.status = 'published' and n.search like ${like} limit 80`,
    sql`select slug, title, date, description from videos where status = 'published' and search like ${like} limit 40`,
    sql`select path, title, blocks from pages where status = 'published' limit 2000`,
  ]);
  const pages = pg.filter((p: any) => fold(`${p.title} ${docText(p.blocks || [], 100000)}`).includes(f)).slice(0, 60);
  const groups = [
    { title: "Lectures and transcriptions", hits: aud.map((r: any) => ({ id: `a:${r.slug}`, title: r.title, sub: [r.date ? String(r.date).slice(0, 10) : "", r.place].filter(Boolean).join(" · "), snippet: snip(`${r.title} ${r.summary || ""} ${docText(r.transcript || [], 200000)}`) })) },
    { title: "Books", hits: bn.map((r: any) => ({ id: `bn:${r.id}`, title: r.title, sub: r.book, snippet: snip(`${r.title} ${docText(r.blocks || [], 200000)}`) })) },
    { title: "Compilations", hits: ex.map((r: any) => ({ id: `ex:${r.slug}`, title: r.title || r.verse_ref || (EXK.find(([k]) => k === r.kind)?.[1] || ""), sub: r.source || "", snippet: snip(`${r.text} ${r.translation || ""}`) })) },
    { title: "Pages", hits: pages.map((r: any) => ({ id: `p:${r.path}`, title: r.title, sub: r.path, snippet: snip(`${r.title} ${docText(r.blocks || [], 100000)}`) })) },
    { title: "Videos", hits: vid.map((r: any) => ({ id: `v:${r.slug}`, title: r.title, sub: r.date ? String(r.date).slice(0, 10) : "", snippet: snip(`${r.title} ${r.description || ""}`) })) },
  ].filter((g) => g.hits.length);
  return { total: groups.reduce((n, g) => n + g.hits.length, 0), groups };
}

/** What the document pane shows for a node. */
export async function content(id: string): Promise<{ kind: string; title: string; sub?: string; blocks?: any[]; items?: { id: string; title: string; sub?: string; blocks?: any[]; text?: string }[]; data?: any } | null> {
  if (!hasDb() || !id) return null;
  const [t, a] = id.split(":"); const rest = id.slice(t.length + 1);
  if (t === "a") { const r = (await sql`select * from audios where slug = ${a} and status = 'published'`)[0] as any; if (!r) return null; return { kind: "audio", title: r.title, sub: [r.date ? String(r.date).slice(0, 10) : r.date_note, r.place, verseRef(r), durText(r.duration_sec)].filter(Boolean).join(" · "), blocks: r.transcript || [], data: { url: r.audio_url, slug: r.slug, summary: r.summary } }; }
  if (t === "bn") { const r = (await sql`select n.*, b.title as book, b.slug as bslug from book_nodes n join books b on b.id = n.book_id where n.id = ${a}`)[0] as any; if (!r) return null; const kids = await sql`select id, title, blocks from book_nodes where parent_id = ${a} and status = 'published' order by position`; return { kind: "chapter", title: r.title, sub: r.book, blocks: r.blocks || [], items: kids.map((k: any) => ({ id: `bn:${k.id}`, title: k.title, blocks: k.blocks })) }; }
  if (t === "book") { const b = (await sql`select * from books where id = ${a}`)[0] as any; if (!b) return null; const nodes = await sql`select id, book_id, parent_id, kind, position, title, slug, status, blocks from book_nodes where book_id = ${a} and status = 'published'`; const flat = order(nodes as any); return { kind: "book", title: b.title, sub: [b.author, b.year].filter(Boolean).join(" · "), data: { description: b.description }, items: flat.map((n: any) => ({ id: `bn:${n.id}`, title: n.title, blocks: (nodes as any[]).find((x) => x.id === n.id)?.blocks || [] })) }; }
  if (t === "ex") { const r = (await sql`select e.*, a.title as lecture from excerpts e left join audios a on a.id = e.audio_id where e.slug = ${a}`)[0] as any; if (!r) return null; return { kind: "excerpt", title: r.title || r.verse_ref || "", sub: r.source || r.lecture || r.author || "", data: r }; }
  if (t === "exk") { const rows = await sql`select e.slug, e.title, e.text, e.verse_ref, e.original, e.transliteration, e.translation, e.source, a.title as lecture from excerpts e left join audios a on a.id = e.audio_id where e.kind = ${a} and e.status = 'published' order by e.position, e.created_at limit 2000`; return { kind: "excerpts", title: EXK.find(([k]) => k === a)?.[1] || a, items: rows.map((r: any) => ({ id: `ex:${r.slug}`, title: r.title || r.verse_ref || "", sub: r.source || r.lecture || "", text: [r.original, r.transliteration, r.translation, r.text].filter(Boolean).join("\n\n") })) }; }
  if (t === "v") { const r = (await sql`select * from videos where slug = ${a}`)[0] as any; if (!r) return null; return { kind: "video", title: r.title, sub: [r.date ? String(r.date).slice(0, 10) : "", r.place].filter(Boolean).join(" · "), data: r }; }
  if (t === "p") { const r = (await sql`select title, blocks from pages where path = ${rest} and status = 'published'`)[0] as any; if (!r) return { kind: "missing", title: "This page has no text yet", sub: rest }; return { kind: "page", title: r.title, blocks: r.blocks || [], data: { path: rest } }; }
  if (t === "ay" || t === "am") { const kids = (await children(id)).filter((k) => k.id.startsWith("a:")).slice(0, 60); const rows = kids.length ? await sql`select slug, title, transcript, date, place from audios where slug = any(${kids.map((k) => k.id.slice(2))})` : []; const by = Object.fromEntries(rows.map((r: any) => [r.slug, r])); return { kind: "list", title: id.split(":").slice(2).map((x, i) => (i === 1 ? MONTHS[Number(x) - 1] || "" : x === "0" ? "Date unknown" : x)).join(" "), items: kids.map((k) => ({ id: k.id, title: k.title, sub: k.sub, blocks: id.split(":")[1] === "transcripts" ? by[k.id.slice(2)]?.transcript : undefined })) }; }
  return null;
}
