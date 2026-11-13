import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

/* The original file a book was made from (Word, EPUB, …), kept as a backup for the Studio only — never public.
   Large files arrive in parts of up to 3 MB: part 0 creates the row, later parts are appended in order.
   GET → list; GET ?sid= → download; POST (form: file, name, mime, size, index, total, sid?) → upload a part; DELETE ?sid= (admin). */
const ID = /^[0-9a-f-]{36}$/i;
type P = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: P) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; if (!ID.test(id)) return fail("Unknown book.");
  const sid = new URL(req.url).searchParams.get("sid");
  if (!sid) return json(await sql`select id, filename, mime, size, created_at from book_sources where book_id = ${id} and complete order by created_at desc`);
  if (!ID.test(sid)) return fail("Unknown file.");
  const r = (await sql`select filename, mime, encode(data, 'base64') b64 from book_sources where id = ${sid} and book_id = ${id} and complete`)[0] as any;
  if (!r) return fail("That file is not here.", 404);
  return new Response(Buffer.from(r.b64, "base64"), { headers: { "content-type": r.mime || "application/octet-stream", "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(r.filename)}`, "cache-control": "private, no-store" } });
}

export async function POST(req: Request, { params }: P) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const { id } = await params; if (!ID.test(id)) return fail("Unknown book.");
  const f = await req.formData(); const part = f.get("file") as File | null;
  const index = Number(f.get("index")), total = Number(f.get("total")); const sid = String(f.get("sid") || "");
  if (!part || !Number.isInteger(index) || !Number.isInteger(total) || index < 0 || total < 1 || index >= total || total > 40) return fail("The file part is not valid.");
  if (part.size > 3_200_000) return fail("A file part is too large.");
  const hex = Buffer.from(await part.arrayBuffer()).toString("hex");
  if (index === 0) {
    const name = String(f.get("name") || "book").slice(0, 200); const mime = String(f.get("mime") || "application/octet-stream").slice(0, 120); const size = Math.min(2 ** 31 - 1, Number(f.get("size")) || 0);
    if (size > 100_000_000) return fail("Files over 100 MB are not kept.");
    const r = await sql`insert into book_sources (book_id, filename, mime, size, data, complete, created_by) values (${id}, ${name}, ${mime}, ${size}, decode(${hex}, 'hex'), ${total === 1}, ${g.user.id}) returning id`;
    return json({ sid: r[0].id });
  }
  if (!ID.test(sid)) return fail("Unknown file.");
  const r = await sql`update book_sources set data = data || decode(${hex}, 'hex'), complete = ${index === total - 1} where id = ${sid} and book_id = ${id} and not complete returning id`;
  if (!r.length) return fail("That upload could not continue.");
  return json({ sid });
}

export async function DELETE(req: Request, { params }: P) {
  const g = await guard("admin"); if ("res" in g) return g.res;
  const { id } = await params; const sid = new URL(req.url).searchParams.get("sid") || "";
  if (!ID.test(id) || !ID.test(sid)) return fail("Unknown file.");
  await sql`delete from book_sources where id = ${sid} and book_id = ${id}`; return json({ ok: true });
}
