import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";

/** Suggestions from visitors. GET ?status=new|done|declined|all · POST { id, status, note? } · DELETE { id } */
export async function GET(req: Request) {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const u = new URL(req.url).searchParams;
  if (u.get("count")) return json({ new: ((await sql`select count(*)::int as n from suggestions where status = 'new'`)[0] as any).n });
  const st = u.get("status") || "new";
  const rows = await sql`select * from suggestions where (${st} = 'all' or status = ${st}) order by created_at desc limit 500`;
  const counts = await sql`select status, count(*)::int as n from suggestions group by status`;
  return json({ rows, counts });
}
/** Replace the first place a passage appears in a transcription (inside one run of text). */
function replaceIn(doc: any[], from: string, to: string): boolean {
  let done = false;
  const walk = (x: any): any => { if (done || !x) return x; if (Array.isArray(x)) return x.map(walk);
    if (typeof x === "object") { if (x.type === "text" && typeof x.text === "string" && x.text.includes(from)) { done = true; return { ...x, text: x.text.replace(from, to) }; } const o: any = {}; for (const k in x) o[k] = walk(x[k]); return o; }
    return x; };
  const out = walk(doc); if (done) doc.splice(0, doc.length, ...out); return done;
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  /** { accept: id, text? } — put the suggested words into the transcription in place of the quoted passage. */
  if (b.accept) {
    const s = (await sql`select * from suggestions where id = ${b.accept}`)[0] as any; if (!s) return fail("Not found.");
    const to = String(b.text ?? s.text).trim(); if (!s.quote || !to) return fail("This suggestion has no passage to replace. Open the lecture and make the change there.");
    const a = (await sql`select * from audios where id = ${s.item_id} or slug = ${s.item_slug} limit 1`)[0] as any; if (!a) return fail("The recording was not found.");
    const doc = Array.isArray(a.transcript) ? a.transcript : [];
    if (!replaceIn(doc, s.quote.trim(), to)) return fail("The passage was not found exactly as quoted (it may cross formatting). Open the lecture and make the change there.");
    const { docText } = await import("@/components/cms/doc-text"); const { fold } = await import("@/lib/content/text"); const { searchText } = await import("@/lib/content/audios");
    await sql`update audios set transcript = ${JSON.stringify(doc)}::jsonb, search = ${`${searchText(a)} ${fold(docText(doc, 400000))}`.trim()}, updated_at = now() where id = ${a.id}`;
    await sql`update suggestions set status = 'done', applied = true where id = ${s.id}`;
    const { freshSite } = await import("@/lib/fresh"); freshSite();
    return json({ ok: true, href: a.code ? `/audios/${a.code}` : `/teachings/audio/${a.slug}` });
  }
  /** { reply: id, text } — keep a reply with the suggestion. */
  if (b.reply) { await sql`update suggestions set reply = ${String(b.text || "").trim() || null}, replied_at = now() where id = ${b.reply}`; return json({ ok: true }); }
  if (!b.id || !["new", "done", "declined"].includes(b.status)) return fail("Nothing to do.");
  await sql`update suggestions set status = ${b.status}, note = coalesce(${b.note ?? null}, note) where id = ${b.id}`; return json({ ok: true });
}
export async function DELETE(req: Request) { const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); await sql`delete from suggestions where id = ${b.id}`; return json({ ok: true }); }
