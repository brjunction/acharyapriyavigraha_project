import { sql } from "@/lib/db";
import { fold, slugify } from "./text";
import { plainText } from "@/components/cms/doc-text";

export const ARTICLE_COLS = ["title", "subtitle", "author", "series", "series_part", "section", "date", "summary", "cover", "body", "topics", "source", "source_url", "position", "status"] as const;
export const MAG_COLS = ["title", "publisher", "description", "cover", "url", "issues", "position", "status"] as const;

const docText = (doc: any): string => (Array.isArray(doc) ? doc.map((b: any) => [plainText(b?.content), docText(b?.children)].join(" ")).join(" ") : "");
export function cleanArticle(b: Record<string, any>) {
  const o: Record<string, any> = {};
  for (const k of ARTICLE_COLS) if (k in b) {
    let v = b[k];
    if (k === "series_part" || k === "position") v = v === "" || v == null ? (k === "position" ? 0 : null) : Number(v) || null;
    else if (k === "topics") v = Array.isArray(v) ? v.map(String).map((x) => x.trim()).filter(Boolean) : String(v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    else if (k === "body") v = JSON.stringify(Array.isArray(v) ? v : []);
    else if (k === "date") v = v ? String(v).slice(0, 10) : null;
    else v = v == null ? null : String(v).trim() || null;
    o[k] = v;
  }
  if ("status" in o && !o.status) o.status = "published";
  return o;
}
export const articleSearch = (a: Record<string, any>) => fold([a.title, a.subtitle, a.author, a.series, a.section, a.summary, (a.topics || []).join(" "), docText(typeof a.body === "string" ? JSON.parse(a.body) : a.body)].filter(Boolean).join(" ")).slice(0, 200000);
export async function articleSlug(title: string, id?: string) {
  let s = slugify(title), n = 1; const b = s;
  while ((await sql`select 1 from articles where slug = ${s} and id is distinct from ${id ?? null}`).length) s = `${b}-${++n}`;
  return s;
}
