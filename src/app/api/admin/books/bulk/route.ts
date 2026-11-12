import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { revalidatePath } from "next/cache";

/* Many books at once.
   { op: "publish" | "hide", ids } or { op, library } (every book of that library that is not already so)
   { op: "delete", ids }                        — admins only; chapters go with the book
   { op: "set", ids, fields: { category, author, publisher, language, layout, library, acharya, kind, subject, year } }
   Only the fields named here can be changed; a field sent as "" is cleared. */
const SET: Record<string, { max: number; values?: string[]; required?: boolean }> = {
  category: { max: 120 }, author: { max: 200 }, publisher: { max: 200 }, language: { max: 12, required: true }, year: { max: 12 },
  layout: { max: 40, required: true }, library: { max: 20, values: ["main", "gaudiya"], required: true },
  acharya: { max: 160 }, kind: { max: 20, values: ["book", "scripture", "songs"], required: true }, subject: { max: 160 },
};
const isId = (x: unknown) => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x);

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(b.ids) ? b.ids.filter(isId).slice(0, 5000) : [];
  if (Array.isArray(b.ids) && ids.length !== b.ids.length) return fail("Some of the chosen books are not valid.");

  if (b.op === "delete") {
    const g = await guard("admin"); if ("res" in g) return g.res;
    if (!ids.length) return fail("Tick the books to delete.");
    const r = await sql`delete from books where id = any(${ids}::uuid[]) returning id`;
    revalidatePath("/", "layout"); return json({ ok: true, n: r.length });
  }

  const g = await guard("editor"); if ("res" in g) return g.res;

  if (b.op === "set") {
    if (!ids.length) return fail("Tick the books to change.");
    const f = b.fields && typeof b.fields === "object" ? b.fields : {};
    const keys = Object.keys(f); if (!keys.length) return fail("Choose what to change.");
    const vals: Record<string, string | null> = {};
    for (const k of keys) {
      const rule = SET[k]; if (!rule) return fail(`“${k}” cannot be changed here.`);
      const v = f[k] == null ? "" : String(f[k]).trim();
      if (v.length > rule.max) return fail(`“${k}” is too long.`);
      if (!v && rule.required) return fail(`“${k}” cannot be empty.`);
      if (v && rule.values && !rule.values.includes(v)) return fail(`“${v}” is not a choice for “${k}”.`);
      vals[k] = v || null;
    }
    const has = (k: string) => k in vals;
    const r = await sql`update books set
        category  = case when ${has("category")}  then ${vals.category ?? null}  else category  end,
        author    = case when ${has("author")}    then ${vals.author ?? null}    else author    end,
        publisher = case when ${has("publisher")} then ${vals.publisher ?? null} else publisher end,
        language  = case when ${has("language")}  then ${vals.language ?? null}  else language  end,
        year      = case when ${has("year")}      then ${vals.year ?? null}      else year      end,
        layout    = case when ${has("layout")}    then ${vals.layout ?? null}    else layout    end,
        library   = case when ${has("library")}   then ${vals.library ?? null}   else library   end,
        acharya   = case when ${has("acharya")}   then ${vals.acharya ?? null}   else acharya   end,
        kind      = case when ${has("kind")}      then ${vals.kind ?? null}      else kind      end,
        subject   = case when ${has("subject")}   then ${vals.subject ?? null}   else subject   end,
        updated_at = now()
      where id = any(${ids}::uuid[]) returning id`;
    revalidatePath("/", "layout"); return json({ ok: true, n: r.length });
  }

  const status = b.op === "publish" ? "published" : b.op === "hide" ? "draft" : null; if (!status) return fail("Unknown action.");
  const r = ids.length ? await sql`update books set status = ${status}, updated_at = now() where id = any(${ids}::uuid[]) returning id`
    : b.library === "main" || b.library === "gaudiya" ? await sql`update books set status = ${status}, updated_at = now() where library = ${b.library} and status <> ${status} returning id` : [];
  revalidatePath("/", "layout"); return json({ ok: true, n: r.length });
}
