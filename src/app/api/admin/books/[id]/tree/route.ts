import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { nodeSlug, nodeSearch } from "@/lib/content/books";
import { headsOf, headingBlock, blockText } from "@/lib/content/heads";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/content/text";
import { articleSearch, articleSlug } from "@/lib/content/articles";

export const maxDuration = 120;
/** Work on a book's contents list in one step:
    order    { items: [{ id, parent_id, position }] }   the whole list after dragging, indenting…
    delete   { ids }       ·  delete-all
    publish  { ids? }      every unpublished change (or of these chapters) goes live
    discard  { ids }       unpublished changes are thrown away
    hide / show { ids }
    merge    { id }        the chapter becomes a heading inside the page above it (its parent, else the chapter before it)
    split    { id, block } a heading inside the page becomes its own page, under it */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id: book } = await params; const b = await req.json().catch(() => ({}));
  const all = (await sql`select id, parent_id, position, title, slug, status, blocks, draft from book_nodes where book_id = ${book}`) as any[]; const by = new Map(all.map((n) => [n.id, n]));
  const ids: string[] = Array.isArray(b.ids) ? b.ids.filter((x: string) => by.has(x)) : [];
  const done = (x: any = { ok: true }) => { revalidatePath("/books", "layout"); return json(x); };
  const cur = (n: any) => ({ title: n.draft?.title ?? n.title, blocks: (n.draft?.blocks ?? n.blocks) as any[] });
  switch (b.op) {
    case "order": {
      const items: any[] = Array.isArray(b.items) ? b.items : []; if (items.length !== all.length || !items.every((x) => by.has(x.id) && (!x.parent_id || by.has(x.parent_id)))) return fail("The contents changed meanwhile. Please reload the page.");
      const parent = new Map(items.map((x) => [x.id, x.parent_id || null])); for (const x of items) { let c = parent.get(x.id), k = 0; while (c && k++ < 50) { if (c === x.id) return fail("A chapter cannot go inside itself."); c = parent.get(c); } }
      for (const x of items) { const n = by.get(x.id); const p = x.parent_id || null; const pos = Number(x.position) || 0; if (n.parent_id === p && n.position === pos) continue;
        const slug = n.parent_id === p ? n.slug : await nodeSlug(book, p, n.title, n.id); await sql`update book_nodes set parent_id = ${p}, position = ${pos}, slug = ${slug} where id = ${x.id}`; }
      return done(); }
    case "delete": if (!ids.length) return fail("Choose chapters first."); await sql`delete from book_nodes where id = any(${ids}::uuid[])`; return done({ ok: true, n: ids.length });
    case "delete-all": await sql`delete from book_nodes where book_id = ${book}`; return done();
    case "hide": case "show": await sql`update book_nodes set status = ${b.op === "show" ? "published" : "draft"} where id = any(${ids}::uuid[])`; return done();
    case "discard": await sql`update book_nodes set draft = null where id = any(${ids}::uuid[])`; return done();
    case "publish": {
      const list = ids.length ? ids.map((x) => by.get(x)) : all.filter((n) => n.draft || n.status !== "published"); let k = 0;
      for (const n of list) { const c = cur(n); const slug = c.title !== n.title ? await nodeSlug(book, n.parent_id, c.title, n.id) : n.slug;
        await sql`update book_nodes set title = ${c.title}, slug = ${slug}, blocks = ${JSON.stringify(c.blocks)}::jsonb, heads = ${JSON.stringify(headsOf(c.blocks))}::jsonb, search = ${nodeSearch(c.title, c.blocks)}, draft = null, status = 'published', published_at = now(), updated_at = now() where id = ${n.id}`; k++; }
      return done({ ok: true, n: k }); }
    case "merge": {
      const x = by.get(b.id); if (!x) return fail("Not found", 404);
      let target = x.parent_id ? by.get(x.parent_id) : null;
      if (!target) { const sibs = all.filter((n) => !n.parent_id && n.position < x.position).sort((p, q) => q.position - p.position); target = sibs[0]; }
      if (!target) return fail("There is no page above this one to put it into.");
      const kids = (p: string, d: number): any[] => all.filter((n) => n.parent_id === p).sort((a, c) => a.position - c.position).flatMap((n) => [headingBlock(cur(n).title, Math.min(3, d)), ...cur(n).blocks, ...kids(n.id, d + 1)]);
      const t = cur(target); const blocks = [...t.blocks, headingBlock(cur(x).title, 2), ...cur(x).blocks, ...kids(x.id, 3)];
      await sql`update book_nodes set draft = ${JSON.stringify({ title: t.title, blocks })}::jsonb, updated_at = now() where id = ${target.id}`; await sql`delete from book_nodes where id = ${x.id}`;
      return done({ ok: true, target: target.id }); }
    case "split": {
      const x = by.get(b.id); if (!x) return fail("Not found", 404); const c = cur(x); const i = c.blocks.findIndex((k: any) => k.id === b.block); if (i < 0 || c.blocks[i].type !== "heading") return fail("That heading was not found. Save the page first.");
      const L = c.blocks[i].props?.level || 2; let j = i + 1; while (j < c.blocks.length && !(c.blocks[j].type === "heading" && (c.blocks[j].props?.level || 2) <= L)) j++;
      const title = blockText(c.blocks[i]).trim() || "Untitled chapter"; const moved = c.blocks.slice(i + 1, j); const rest = [...c.blocks.slice(0, i), ...c.blocks.slice(j)];
      const pos = Number((await sql`select coalesce(max(position), -1) + 1 as p from book_nodes where book_id = ${book} and parent_id = ${x.id}`)[0].p);
      const r = await sql`insert into book_nodes (book_id, parent_id, kind, position, title, slug, blocks, draft, status, search) values (${book}, ${x.id}, 'chapter', ${pos}, ${title}, ${await nodeSlug(book, x.id, title)}, '[]'::jsonb, ${JSON.stringify({ title, blocks: moved })}::jsonb, 'draft', ${nodeSearch(title, moved)}) returning id`;
      await sql`update book_nodes set draft = ${JSON.stringify({ title: c.title, blocks: rest })}::jsonb, updated_at = now() where id = ${x.id}`;
      return done({ ok: true, id: r[0].id }); }
    case "to-issue": {   // a book that is really one magazine issue: its chapters become the issue's articles, and the book goes
      const m = (await sql`select id from magazines where id = ${b.magazine_id || null}`)[0] as any; if (!m) return fail("Choose the magazine.");
      const bk = (await sql`select * from books where id = ${book}`)[0] as any; const label = String(b.number || bk.title).trim(); let slug = slugify(label), k = 1; const base = slug;
      while ((await sql`select 1 from magazine_issues where magazine_id = ${m.id} and slug = ${slug}`).length) slug = `${base}-${++k}`;
      const day = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || "")) ? b.date : null; const pos = Number((await sql`select coalesce(max(position), 0) + 1 as n from magazine_issues where magazine_id = ${m.id}`)[0].n);
      const iss = (await sql`insert into magazine_issues (magazine_id, slug, number, title, date, year, cover, position, status) values (${m.id}, ${slug}, ${b.number || null}, ${b.number ? null : bk.title}, ${day}, ${day ? Number(day.slice(0, 4)) : null}, ${bk.cover_url}, ${pos}, ${bk.status}) returning id`)[0] as any;
      const kids = (p: string | null) => all.filter((n) => n.parent_id === p).sort((a, c) => a.position - c.position);
      const deep = (p: string, d: number): any[] => kids(p).flatMap((n) => [headingBlock(cur(n).title, Math.min(3, d)), ...cur(n).blocks, ...deep(n.id, d + 1)]);
      let i = 0; for (const n of kids(null)) { const c = cur(n); const body = [...c.blocks, ...deep(n.id, 2)]; if (!body.length) continue; i++;
        await sql`insert into articles (slug, search, title, author, body, date, status, issue_id, issue_position) values (${await articleSlug(c.title)}, ${articleSearch({ title: c.title, author: bk.author, body })}, ${c.title}, ${bk.author}, ${JSON.stringify(body)}::jsonb, ${day}, ${bk.status}, ${iss.id}, ${i})`; }
      await sql`delete from books where id = ${book}`; revalidatePath("/teachings/magazines", "layout"); return done({ ok: true, n: i }); }
  }
  return fail("Unknown action.");
}
