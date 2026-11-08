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
  /** { emptySpam: true } — delete everything marked as spam. */
  if (b.emptySpam) { const r = await sql`delete from suggestions where status = 'spam' returning 1`; return json({ deleted: r.length }); }
  /** { accept: id, proposed? } on an edit — replace the whole paragraph with the visitor's corrected version (bold and italic kept). */
  if (b.accept) {
    const s = (await sql`select * from suggestions where id = ${b.accept}`)[0] as any; if (!s) return fail("Not found.");
    if (s.original && (b.proposed ?? s.proposed)) {
      const a = (await sql`select * from audios where id = ${s.item_id} or slug = ${s.item_slug} limit 1`)[0] as any; if (!a) return fail("The recording was not found.");
      const { mdInline } = await import("@/lib/md-blocks"); const plain = (c: any): string => (Array.isArray(c) ? c : []).map((x: any) => (typeof x === "string" ? x : x.type === "link" ? plain(x.content) : String(x.text || ""))).join("");
      const norm = (t: string) => t.replace(/\s+/g, " ").trim(); const want = norm(s.original);
      const field = Array.isArray(a.transcript) && a.transcript.length ? "transcript" : "machine_transcript"; const doc = Array.isArray(a[field]) ? a[field] : [];
      let hit = false; const walk = (xs: any[]): any[] => xs.map((x) => { if (hit || !x) return x; if (Array.isArray(x.content) && norm(plain(x.content)) === want) { hit = true; return { ...x, content: mdInline(String(b.proposed ?? s.proposed)) }; } return x.children?.length ? { ...x, children: walk(x.children) } : x; });
      const out = walk(doc); if (!hit) return fail("This paragraph has changed since the suggestion was sent, so it cannot be applied by itself. Open the recording and make the change there.");
      const { docText } = await import("@/components/cms/doc-text"); const { fold } = await import("@/lib/content/text"); const { searchText } = await import("@/lib/content/audios");
      if (field === "transcript") await sql`update audios set transcript = ${JSON.stringify(out)}::jsonb, search = ${`${searchText(a)} ${fold(docText(out, 400000))}`.trim()}, updated_at = now() where id = ${a.id}`;
      else await sql`update audios set machine_transcript = ${JSON.stringify(out)}::jsonb, updated_at = now() where id = ${a.id}`;
      await sql`update suggestions set status = 'done', applied = true, proposed = ${String(b.proposed ?? s.proposed)} where id = ${s.id}`;
      const { freshSite } = await import("@/lib/fresh"); freshSite();
      return json({ ok: true, href: a.code ? `/audios/${a.code}` : `/teachings/audio/${a.slug}` });
    }
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
  if (!b.id || !["new", "done", "declined", "spam"].includes(b.status)) return fail("Nothing to do.");
  await sql`update suggestions set status = ${b.status}, note = coalesce(${b.note ?? null}, note) where id = ${b.id}`; return json({ ok: true });
}
export async function DELETE(req: Request) { const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json(); await sql`delete from suggestions where id = ${b.id}`; return json({ ok: true }); }
