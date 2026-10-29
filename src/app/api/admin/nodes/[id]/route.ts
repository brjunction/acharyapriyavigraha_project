import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { nodeSlug, nodeSearch } from "@/lib/content/books";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { id } = await params;
  const r = await sql`select * from book_nodes where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res; const { id } = await params; const b = await req.json();
  const n = (await sql`select * from book_nodes where id = ${id}`)[0]; if (!n) return fail("Not found", 404);
  const title = b.title !== undefined ? String(b.title).trim() || n.title : n.title; const blocks = Array.isArray(b.blocks) ? b.blocks : n.blocks;
  const slug = b.slug ? await nodeSlug(n.book_id, n.parent_id, b.slug, id) : b.title !== undefined && title !== n.title ? await nodeSlug(n.book_id, n.parent_id, title, id) : n.slug;
  await sql`update book_nodes set title = ${title}, slug = ${slug}, blocks = ${JSON.stringify(blocks)}::jsonb, kind = ${b.kind || n.kind}, status = ${g.user.role === "contributor" ? n.status : b.status || n.status}, search = ${nodeSearch(title, blocks)}, updated_at = now() where id = ${id}`;
  revalidatePath("/books", "layout"); return json({ ok: true, slug });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { id } = await params; await sql`delete from book_nodes where id = ${id}`; revalidatePath("/books", "layout"); return json({ ok: true });
}
