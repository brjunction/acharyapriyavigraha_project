import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

/* Publish, unpublish or delete many items at once, in any section of the Studio.
   { kind, op: "publish" | "hide" | "delete", ids }  or  { kind, op: "publish", drafts: true, magazine_id? } (every draft).
   Table names come only from the list below, never from the request. Publishing magazine issues publishes their articles too. */
const KINDS: Record<string, { table: string; label: string }> = {
  articles: { table: "articles", label: "articles" },
  magazines: { table: "magazines", label: "magazines" },
  issues: { table: "magazine_issues", label: "issues" },
  audios: { table: "audios", label: "lectures" },
  videos: { table: "videos", label: "videos" },
  excerpts: { table: "excerpts", label: "excerpts" },
  timeline: { table: "life_events", label: "moments" },
  archive: { table: "archive_items", label: "items" },
  diary: { table: "diary_entries", label: "diary pages" },
  books: { table: "books", label: "books" },
};
const isId = (x: unknown) => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x);

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const k = KINDS[b.kind]; if (!k) return fail("Unknown section.");
  const ids: string[] = Array.isArray(b.ids) ? b.ids.filter(isId).slice(0, 10000) : [];
  if (Array.isArray(b.ids) && ids.length !== b.ids.length) return fail("Some of the chosen items are not valid.");
  const op = b.op;
  if (!["publish", "hide", "delete"].includes(op)) return fail("Unknown action.");
  const g = await guard(op === "delete" ? "admin" : "editor"); if ("res" in g) return g.res;

  try {
    let n = 0;
    if (op === "delete") {
      if (!ids.length) return fail("Tick the items to delete.");
      n = (await sql.query(`delete from ${k.table} where id = any($1::uuid[]) returning id`, [ids]) as any[]).length;
    } else {
      const status = op === "publish" ? "published" : "draft";
      let where = "", params: unknown[] = [status];
      if (ids.length) { where = "id = any($2::uuid[])"; params.push(ids); }
      else if (b.drafts === true && op === "publish") {
        where = "status <> 'published'";
        if (b.kind === "issues" && isId(b.magazine_id)) { where += " and magazine_id = $2"; params.push(b.magazine_id); }
      } else return fail("Tick the items first.");
      const rows = await sql.query(`update ${k.table} set status = $1 where ${where} returning id`, params) as { id: string }[];
      n = rows.length;
      if (b.kind === "issues" && rows.length) await sql`update articles set status = ${status} where issue_id = any(${rows.map((r) => r.id)}::uuid[])`;
    }
    revalidatePath("/", "layout");
    return json({ ok: true, n });
  } catch (e: any) {
    return fail(/foreign key|violates/i.test(e?.message || "") ? `Some of these ${k.label} are still used elsewhere, so they were not deleted.` : "That could not be done. Please try again.");
  }
}
