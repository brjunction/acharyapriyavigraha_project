import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

/* Upload a large public file (a magazine issue's PDF), in parts of up to 3 MB: part 0 creates it, later parts append.
   POST form: file, name, mime, size, index, total, sid? → { sid, url } (url is public once the last part arrives). */
const ID = /^[0-9a-f-]{36}$/i;
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const f = await req.formData(); const part = f.get("file") as File | null;
  const index = Number(f.get("index")), total = Number(f.get("total")); const sid = String(f.get("sid") || "");
  if (!part || !Number.isInteger(index) || !Number.isInteger(total) || index < 0 || total < 1 || index >= total || total > 70) return fail("The file part is not valid.");
  if (part.size > 3_200_000) return fail("A file part is too large.");
  const hex = Buffer.from(await part.arrayBuffer()).toString("hex");
  if (index === 0) {
    const mime = String(f.get("mime") || ""); if (mime !== "application/pdf") return fail("Only PDF files can be uploaded here.");
    const size = Number(f.get("size")) || 0; if (size > 200_000_000) return fail("Files over 200 MB cannot be uploaded; please give a link instead.");
    const r = await sql`insert into files (filename, mime, size, data, complete, kind, created_by) values (${String(f.get("name") || "file.pdf").slice(0, 200)}, ${mime}, ${size}, decode(${hex}, 'hex'), ${total === 1}, 'issue-pdf', ${g.user.id}) returning id`;
    return json({ sid: r[0].id, url: `/api/files/${r[0].id}` });
  }
  if (!ID.test(sid)) return fail("Unknown file.");
  const r = await sql`update files set data = data || decode(${hex}, 'hex'), complete = ${index === total - 1} where id = ${sid} and not complete returning id`;
  if (!r.length) return fail("That upload could not continue.");
  return json({ sid, url: `/api/files/${sid}` });
}
