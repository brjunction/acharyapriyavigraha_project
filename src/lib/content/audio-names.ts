/* The two extra names every recording gets from its details:
   - a file name for downloading, e.g. 1977_10_11_Bhubaneswar_Bhagavatam_10_66.mp3
   - a short code for its web address, e.g. /audios/19661011BBSR1 (date, place, and a number for that day and place). */
import { sql } from "@/lib/db";
import { placeCode, fileTitle } from "./audio-names-core";
export { placeCode, fileTitle };

/** e.g. 19661011BBSR1 — unique; the number counts recordings of the same day and place. */
export async function nextCode(a: { date?: string | null; place?: string | null }, id?: string | null) {
  const base = `${a.date ? String(a.date).slice(0, 10).replace(/-/g, "") : "00000000"}${placeCode(a.place)}`;
  for (let n = 1; n < 500; n++) { const c = `${base}${n}`; if (!(await sql`select 1 from audios where code = ${c} and id is distinct from ${id ?? null}`).length) return c; }
  return `${base}${Date.now() % 100000}`;
}
export const validCode = (c?: string | null) => (c ? String(c).trim().replace(/[^0-9A-Za-z_-]/g, "").slice(0, 40) || null : null);
