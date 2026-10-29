import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { slugify } from "@/lib/cms/blocks";
import { revalidatePath } from "next/cache";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const { id } = await params;
  const r = await sql`select * from pages where id = ${id}`; return r[0] ? json(r[0]) : fail("Not found", 404);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const { id } = await params; const b = await req.json();
  const cur = (await sql`select * from pages where id = ${id}`)[0]; if (!cur) return fail("Not found", 404);
  const publishing = b.status === "published" || b.status === "draft";
  if (publishing && g.user.role === "contributor") return fail("Contributors can save drafts; an editor publishes.", 403);
  if (b.blocks) { await sql`insert into page_versions (page_id, title, blocks, saved_by) values (${id}, ${cur.title}, ${JSON.stringify(cur.blocks)}::jsonb, ${g.user.id})`;
    await sql`delete from page_versions where page_id = ${id} and id not in (select id from page_versions where page_id = ${id} order by created_at desc limit 30)`; }
  let path = cur.path, slug = cur.slug, parent = cur.parent_id;
  if ((b.slug && slugify(b.slug) !== cur.slug) || (b.parent_id !== undefined && b.parent_id !== cur.parent_id)) {
    slug = slugify(b.slug || cur.slug); parent = b.parent_id === undefined ? cur.parent_id : b.parent_id || null;
    if (parent === id) return fail("A page cannot sit inside itself.");
    const pp = parent ? (await sql`select path from pages where id = ${parent}`)[0]?.path || "" : "";
    path = `${pp}/${slug}`;
    if (path !== cur.path) {
      if ((await sql`select 1 from pages where path = ${path} and id <> ${id}`).length) return fail("Another page already uses that address.");
      await sql`update pages set path = ${path} || substr(path, ${cur.path.length + 1}) where path like ${cur.path + "/%"}`;
    }
  }
  const title = b.title ?? cur.title;
  const blocks = b.blocks ? JSON.stringify(b.blocks) : JSON.stringify(cur.blocks);
  const seo = b.seo ? JSON.stringify(b.seo) : JSON.stringify(cur.seo);
  const settings = b.settings ? JSON.stringify(b.settings) : JSON.stringify(cur.settings);
  const status = b.status || cur.status;
  await sql`update pages set title = ${title}, slug = ${slug}, path = ${path}, parent_id = ${parent}, blocks = ${blocks}::jsonb, seo = ${seo}::jsonb, settings = ${settings}::jsonb,
    status = ${status}, position = ${b.position ?? cur.position}, updated_by = ${g.user.id}, updated_at = now(),
    published_at = case when ${status} = 'published' and published_at is null then now() else published_at end where id = ${id}`;
  revalidatePath(path); revalidatePath(cur.path); revalidatePath("/sitemap.xml");
  return json({ ok: true, path });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; await sql`delete from pages where id = ${id}`; revalidatePath("/sitemap.xml"); return json({ ok: true });
}
