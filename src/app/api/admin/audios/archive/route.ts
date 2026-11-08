/* Studio → Audio → Import from Archive.org.
   POST { list: "<collection link or name>" } → every MP3 in it, with the details read from each file name, and whether it is already here.
   POST { import: { item, rows: [...], status, kind, language } } → adds the chosen recordings (only the link is stored; the sound stays on Archive.org). */
import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { itemMeta, parseName } from "@/lib/archive";
import { archiveDownload, archiveItem } from "@/lib/archive-url";
import { nextCode } from "@/lib/content/audio-names";
import { searchText, uniqueSlug, slugBase } from "@/lib/content/audios";
import { freshSite } from "@/lib/fresh";

export const maxDuration = 60;
export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res; const b = await req.json();
  if (b.list) {
    const item = archiveItem(String(b.list)); if (!item) return fail("Paste the Archive.org link of the collection.");
    const m = await itemMeta(item, true); if (!m) return fail("Archive.org did not answer for that collection. Check the link, or try again in a minute.");
    const names = new Set(m.files.map((f) => f.name));
    // the files uploaded as MP3; Archive.org's own smaller copies (…_64kb.mp3 and the like) are left out when the original is there
    const mp3 = m.files.filter((f) => /\.mp3$/i.test(f.name) && !(f.source === "derivative" && f.original && names.has(f.original) && /\.mp3$/i.test(f.original)));
    const have = new Set(((await sql`select audio_url from audios where audio_url like ${`https://archive.org/download/${item}/%`}`) as any[]).map((r) => r.audio_url));
    const rows = mp3.map((f) => ({ ...parseName(f.name, f.length, f.size), exists: have.has(archiveDownload(item, f.name)) })).sort((a, b) => (a.date || a.date_note || "9").localeCompare(b.date || b.date_note || "9") || a.name.localeCompare(b.name));
    return json({ item, title: m.title || item, rows });
  }
  if (b.import) {
    const { item, rows, status = "published", kind = "lecture", language = null } = b.import; if (!item || !Array.isArray(rows)) return fail("Nothing to import.");
    const out: { name: string; code?: string; error?: string }[] = [];
    for (const r of rows.slice(0, 60)) {
      try {
        const url = archiveDownload(item, r.name);
        if ((await sql`select 1 from audios where audio_url = ${url}`).length) { out.push({ name: r.name, error: "Already here" }); continue; }
        const a: Record<string, any> = { kind, type: null, title: String(r.title || r.name).slice(0, 300), date: r.date || null, date_note: r.date_note || null, place: r.place || null, country: r.country || null, scripture: r.scripture || null, canto: r.canto ?? null, chapter: r.chapter ?? null, verse: r.verse || null, language, duration_sec: r.duration_sec || null, audio_url: url, file_title: String(r.name).replace(/\.mp3$/i, "") };
        const code = await nextCode(a); const slug = await uniqueSlug(slugBase(a));
        await sql`insert into audios (kind, slug, title, file_title, code, date, date_note, place, country, scripture, canto, chapter, verse, language, duration_sec, audio_url, transcript_status, status, search)
          values (${a.kind}, ${slug}, ${a.title}, ${a.file_title}, ${code}, ${a.date}, ${a.date_note}, ${a.place}, ${a.country}, ${a.scripture}, ${a.canto}, ${a.chapter}, ${a.verse}, ${a.language}, ${a.duration_sec}, ${url}, 'none', ${status === "draft" ? "draft" : "published"}, ${searchText(a)})`;
        out.push({ name: r.name, code });
      } catch (e: any) { out.push({ name: r.name, error: String(e?.message || e).slice(0, 200) }); }
    }
    if (out.some((o) => o.code)) await freshSite();
    return json({ results: out });
  }
  return fail("Unknown request.");
}
