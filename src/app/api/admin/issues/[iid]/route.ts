import { sql } from "@/lib/db";
import { guard, json } from "@/lib/api";
import { revalidatePath } from "next/cache";

/** One issue with its articles, in order. */
export async function GET(_: Request, { params }: { params: Promise<{ iid: string }> }) {
  const g = await guard("viewer"); if ("res" in g) return g.res; const { iid } = await params;
  const issue = (await sql`select *, to_char(date, 'YYYY-MM-DD') as day from magazine_issues where id = ${iid}`)[0];
  const articles = await sql`select id, slug, title, author, status, issue_position from articles where issue_id = ${iid} order by issue_position nulls last, title`;
  return json({ issue, articles });
}
/** Change the issue; {order: [articleIds]} sets the order of its articles; {attach, detach} adds or removes an article. */
export async function PATCH(req: Request, { params }: { params: Promise<{ iid: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { iid } = await params; const b = await req.json();
  if (Array.isArray(b.order)) { for (const [i, id] of b.order.entries()) await sql`update articles set issue_position = ${i} where id = ${id} and issue_id = ${iid}`; }
  else if (b.attach) { const n = Number((await sql`select coalesce(max(issue_position), -1) + 1 as n from articles where issue_id = ${iid}`)[0].n); await sql`update articles set issue_id = ${iid}, issue_position = ${n} where id = ${b.attach}`; }
  else if (b.detach) { await sql`update articles set issue_id = null, issue_position = null where id = ${b.detach} and issue_id = ${iid}`; }
  else {
    const day = b.date ? String(b.date).slice(0, 10) : null;
    await sql`update magazine_issues set number = ${b.number || null}, title = ${b.title || null}, date = ${day}, year = ${b.year ? Number(b.year) : day ? Number(day.slice(0, 4)) : null}, cover = ${b.cover || null}, pdf_url = ${b.pdf_url || null}, url = ${b.url || null}, description = ${b.description || null}, status = ${b.status || "published"}, updated_at = now() where id = ${iid}`;
  }
  revalidatePath("/teachings/magazines", "layout"); revalidatePath("/teachings/articles", "layout"); return json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ iid: string }> }) {
  const g = await guard("editor"); if ("res" in g) return g.res; const { iid } = await params;
  await sql`delete from magazine_issues where id = ${iid}`; revalidatePath("/teachings/magazines", "layout"); return json({ ok: true });
}
