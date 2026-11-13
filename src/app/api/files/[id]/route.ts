import { sql } from "@/lib/db";

/* A public file (an issue's PDF), served in ranges so the PDF reader opens big files quickly, page by page. */
const ID = /^[0-9a-f-]{36}$/i;
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!ID.test(id)) return new Response("Not found", { status: 404 });
  const meta = (await sql`select filename, mime, octet_length(data) len from files where id = ${id} and complete`)[0] as any;
  if (!meta) return new Response("Not found", { status: 404 });
  const len = Number(meta.len); const base = { "content-type": meta.mime, "accept-ranges": "bytes", "cache-control": "public, max-age=31536000, immutable", "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(meta.filename)}` };
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  let a = 0, b = len - 1; let partial = false;
  if (m) { partial = true; if (m[1] === "" && m[2]) { a = Math.max(0, len - Number(m[2])); } else { a = Number(m[1]); b = m[2] ? Math.min(len - 1, Number(m[2])) : len - 1; } if (a > b || a >= len) return new Response(null, { status: 416, headers: { "content-range": `bytes */${len}` } }); }
  const slice = async (from: number, n: number) => Buffer.from(((await sql`select encode(substring(data from ${from + 1} for ${n}), 'base64') b64 from files where id = ${id}`)[0] as any).b64, "base64");
  // The whole file: streamed in 2 MB slices (a plain download, or the reader's first look before it asks for ranges).
  if (!partial) { let at = 0; const stream = new ReadableStream({ async pull(c) { if (at >= len) { c.close(); return; } const n = Math.min(2_000_000, len - at); try { c.enqueue(new Uint8Array(await slice(at, n))); at += n; } catch (e) { c.error(e); } } });
    return new Response(stream, { status: 200, headers: { ...base, "content-length": String(len) } }); }
  if (b - a + 1 > 4_000_000) b = a + 4_000_000 - 1;   // one response stays small
  const body = await slice(a, b - a + 1);
  return new Response(body, { status: 206, headers: { ...base, "content-length": String(body.length), "content-range": `bytes ${a}-${a + body.length - 1}/${len}` } });
}
