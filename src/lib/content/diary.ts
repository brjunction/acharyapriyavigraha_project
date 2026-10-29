import { sql } from "@/lib/db";
import { fold, slugify } from "./text";

export const COLS = ["date", "date_note", "place", "title", "original", "original_lang", "translation", "scan_url", "notes", "volume", "page", "position", "status"];
export const dsearch = (r: any) => fold([r.title, r.date, r.date_note, r.place, r.original, r.translation].filter(Boolean).join(" "));
export async function dslug(r: any, id?: string) { let s = slugify([r.date || r.date_note, r.title || r.place].filter(Boolean).join(" ") || "entry"), n = 1; const b = s; while ((await sql`select 1 from diary_entries where slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`; return s; }

