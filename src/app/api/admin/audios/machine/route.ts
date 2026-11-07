import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { fold } from "@/lib/content/text";
import { searchText } from "@/lib/content/audios";
import { docText } from "@/components/cms/doc-text";
import { aiConfig, askAI, TASKS } from "@/lib/ai";
import { blocksToMd, mdToBlocks } from "@/lib/md-blocks";
import { freshSite } from "@/lib/fresh";

export const maxDuration = 300;
const reSearch = async (id: string) => { const a = (await sql`select * from audios where id = ${id}`)[0] as any; if (!a) return; await sql`update audios set search = ${`${searchText(a)} ${fold(docText(Array.isArray(a.transcript) && a.transcript.length ? a.transcript : a.machine_transcript || [], 400000))}`.trim()} where id = ${id}`; };

/** Which recording a file belongs to, from its name: the address code (19661011BBSR1), the file name (1977_10_11_…), or the address slug. */
async function match(name: string) {
  const base = name.replace(/\.[a-z0-9]+$/i, "").trim();
  const code = /(\d{8}[A-Z]{1,6}\d{1,3})/i.exec(base)?.[1];
  const r = (await sql`select id, title, code, slug from audios where (${code ?? null}::text is not null and upper(code) = upper(${code ?? ""})) or lower(file_title) = lower(${base}) or slug = ${base} or lower(code) = lower(${base}) limit 2`) as any[];
  return r.length === 1 ? r[0] : null;
}

/** GET: how many have each kind of transcription. POST { match: [names] } · { save: { id, blocks, source } } · { ai: id, task? } · { list: "auto-untidied" | "auto" } */
export async function GET() {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const r = (await sql`select count(*) filter (where jsonb_array_length(coalesce(transcript, '[]'::jsonb)) > 0)::int as devotee, count(*) filter (where jsonb_array_length(coalesce(machine_transcript, '[]'::jsonb)) > 0)::int as auto, count(*) filter (where jsonb_array_length(coalesce(machine_transcript, '[]'::jsonb)) > 0 and coalesce(machine_source, '') not ilike '%AI%')::int as untidied, count(*)::int as all from audios`)[0];
  return json(r);
}
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (Array.isArray(b.match)) { const out: any[] = []; for (const name of b.match.slice(0, 2000)) out.push({ name, audio: await match(String(name)) }); return json({ results: out }); }
  if (b.save) {
    const { id, blocks, source } = b.save; if (!Array.isArray(blocks) || !blocks.length) return fail("The file had no text.");
    await sql`update audios set machine_transcript = ${JSON.stringify(blocks)}::jsonb, machine_source = ${String(source || "Automatic").slice(0, 60)}, machine_at = now(), updated_at = now() where id = ${id}`;
    await reSearch(id); return json({ ok: true });
  }
  if (b.list) { const rows = await sql`select id, title from audios where jsonb_array_length(coalesce(machine_transcript, '[]'::jsonb)) > 0 and (${b.list === "auto"} or coalesce(machine_source, '') not ilike '%AI%') order by date nulls last, title`; return json({ rows }); }
  /** Tidy one recording's automatic transcription with the AI (structure + proofread), in place. */
  if (b.ai) {
    const cfg = await aiConfig(); if (!cfg) return fail("No AI key yet — add one in Studio → Settings → AI assistant.");
    const a = (await sql`select id, title, date, date_note, place, scripture, canto, chapter, verse, machine_transcript, machine_source from audios where id = ${b.ai}`)[0] as any; if (!a) return fail("Not found.");
    const md = blocksToMd(a.machine_transcript || []); if (!md.trim()) return fail("This recording has no automatic transcription.");
    const t = TASKS[b.task === "proofread" ? "proofread" : "structure"];
    try {
      const out = (await askAI(cfg, `${t.system}\nAlso correct spelling and punctuation while structuring.`, `About this recording: ${[a.title, a.date || a.date_note, a.place].filter(Boolean).join(" · ")}\n\nText:\n\n${md}`, 60000)).replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/, "").trim();
      const before = md.split(/\s+/).length, after = out.replace(/^#+\s.*$/gm, "").split(/\s+/).length;
      if (after < before * 0.85) return fail(`The AI's answer was much shorter than the text (${after} of ${before} words), so it was not used. Try again.`);
      await sql`update audios set machine_transcript = ${JSON.stringify(mdToBlocks(out))}::jsonb, machine_source = ${`${String(a.machine_source || "Automatic").replace(/ · tidied by AI.*$/, "")} · tidied by AI (${cfg.provider})`}, machine_at = now(), updated_at = now() where id = ${a.id}`;
      await reSearch(a.id); freshSite(); return json({ ok: true, words: { before, after } });
    } catch (e: any) { return fail(e?.name === "TimeoutError" ? "The AI took too long on this one." : e.message); }
  }
  return fail("Nothing to do.");
}
