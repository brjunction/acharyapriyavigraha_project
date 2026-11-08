import { sql, hasDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

/* A visitor's suggestion — never applied by itself; it waits in the Studio until a manager accepts it.
   Spam control: a hidden field only robots fill in; forms sent faster than a person could; no links; length limits;
   a limit per sender each hour and day; exact repeats are dropped; senders marked as spam are quietly ignored.
   The sender mark is a one-way hash, so no address is kept. */
const ok = () => NextResponse.json({ ok: true });
const no = (error: string, status = 400) => NextResponse.json({ error }, { status });
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|top|info|io|ly|me|biz|click|site|online)\b)/i;

export async function POST(req: Request) {
  if (!hasDb()) return no("Not available.", 503);
  let b: any = {}; try { b = await req.json(); } catch {}
  if (b.website) return ok();                                  // the hidden field
  if (typeof b.t === "number" && b.t < 2500) return ok();      // sent faster than a person could read and write
  const text = String(b.text || "").trim().slice(0, 5000);
  const proposed = String(b.proposed || "").trim().slice(0, 8000); const original = String(b.original || "").trim().slice(0, 8000);
  const isEdit = !!(proposed && original);
  if (isEdit && proposed.replace(/[*_]/g, "").replace(/\s+/g, " ") === original.replace(/\s+/g, " ") && proposed === original) return no("Nothing was changed in the passage yet.");
  if (!isEdit && text.length < 3) return no("Please write your suggestion.");
  if (LINK.test(text) || LINK.test(isEdit ? proposed.replace(original, "") : "") || LINK.test(String(b.name || ""))) return no("Links cannot be sent with a suggestion. Please write it in words.");
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const fp = createHash("sha256").update(`${ip}|${req.headers.get("user-agent") || ""}|${process.env.AUTH_SECRET || "tj"}`).digest("hex").slice(0, 24);
  const [st] = (await sql`select count(*) filter (where status = 'spam' and created_at > now() - interval '90 days')::int as spam, count(*) filter (where created_at > now() - interval '1 hour')::int as hour, count(*) filter (where created_at > now() - interval '1 day')::int as day,
      count(*) filter (where created_at > now() - interval '1 day' and coalesce(item_slug, '') = ${String(b.slug || "")} and coalesce(text, '') = ${text} and coalesce(proposed, '') = ${proposed})::int as same from suggestions where fp = ${fp}`) as any[];
  if (st.spam > 0 || st.same > 0) return ok();                 // a known spammer, or the very same suggestion again
  if (st.hour >= 12 || st.day >= 40) return no("Thank you — we have your suggestions. Please wait a while before sending more.", 429);
  const [all] = (await sql`select count(*)::int as n from suggestions where created_at > now() - interval '1 hour'`) as any[];
  if (all.n > 400) return no("Many suggestions are arriving just now. Please try again later.", 429);
  const about = isEdit ? "transcript" : ["transcript", "info", "other"].includes(b.about) ? b.about : "other";
  const a = b.slug ? ((await sql`select id, slug, title from audios where slug = ${String(b.slug)}`.catch(() => []))[0] as any) : null;
  await sql`insert into suggestions (item_kind, item_id, item_slug, item_title, about, quote, text, original, proposed, name, email, fp) values ('audio', ${a?.id || null}, ${a?.slug || b.slug || null}, ${a?.title || null}, ${about}, ${String(b.quote || "").trim().slice(0, 2000) || null}, ${text || (isEdit ? "(an edit of the passage)" : "")}, ${original || null}, ${proposed || null}, ${String(b.name || "").trim().slice(0, 120) || null}, ${String(b.email || "").trim().slice(0, 200) || null}, ${fp})`;
  return ok();
}
