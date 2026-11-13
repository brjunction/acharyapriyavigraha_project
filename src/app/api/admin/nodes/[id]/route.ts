import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { can } from "@/lib/auth";
import { nodeSlug, nodeSearch } from "@/lib/content/books";
import { headsOf } from "@/lib/content/heads";
import { revalidatePath } from "next/cache";

/** A chapter for the editor: its unpublished draft if there is one, else what visitors see. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params;
  const n = (await sql`select * from book_nodes where id = ${id}`)[0] as any; if (!n) return fail("Not found", 404);
  return json({ ...n, live_title: n.title, title: n.draft?.title ?? n.title, blocks: n.draft?.blocks ?? n.blocks, has_draft: !!n.draft });
}
/** Writing saves a draft only. { publish: true } makes the draft what visitors see; { discard: true } throws the draft away. { status } shows or hides the chapter at once. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const n = (await sql`select * from book_nodes where id = ${id}`)[0] as any; if (!n) return fail("Not found", 404);
  if (b.discard) { await sql`update book_nodes set draft = null where id = ${id}`; return json({ ok: true }); }
  // how the contents are laid out: "together" = its sub-sections on this page; "own" = keep this one on its own page; null = normal
  if ("page_mode" in b) { if (!can(g.user, "editor")) return fail("Only editors can change this.", 403); const m = b.page_mode === "together" || b.page_mode === "own" ? b.page_mode : null; await sql`update book_nodes set page_mode = ${m}, updated_at = now() where id = ${id}`; revalidatePath("/books", "layout"); return json({ ok: true }); }
  const title = b.title !== undefined ? String(b.title).trim() || n.title : n.draft?.title ?? n.title; const blocks = Array.isArray(b.blocks) ? b.blocks : n.draft?.blocks ?? n.blocks;
  if (b.publish) {
    if (!can(g.user, "editor")) return fail("Only editors can publish. Your changes are saved as a draft.", 403);
    const slug = title !== n.title ? await nodeSlug(n.book_id, n.parent_id, title, id) : n.slug;
    await sql`update book_nodes set title = ${title}, slug = ${slug}, blocks = ${JSON.stringify(blocks)}::jsonb, heads = ${JSON.stringify(headsOf(blocks))}::jsonb, search = ${nodeSearch(title, blocks)}, draft = null, status = 'published', published_at = now(), updated_at = now() where id = ${id}`;
    revalidatePath("/books", "layout"); return json({ ok: true, slug });
  }
  if (b.status && can(g.user, "editor")) { await sql`update book_nodes set status = ${b.status === "published" ? "published" : "draft"}, updated_at = now() where id = ${id}`; revalidatePath("/books", "layout"); }
  if (b.kind) await sql`update book_nodes set kind = ${b.kind} where id = ${id}`;
  if (b.title !== undefined || Array.isArray(b.blocks)) {
    const same = title === n.title && JSON.stringify(blocks) === JSON.stringify(n.blocks);
    await sql`update book_nodes set draft = ${same ? null : JSON.stringify({ title, blocks })}::jsonb, updated_at = now() where id = ${id}`;
  }
  return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from book_nodes where id = ${id}`; revalidatePath("/books", "layout"); return json({ ok: true });
}
