import { sql } from "@/lib/db";
import { json } from "@/lib/api";

/** The current public announcement, if any. The browser shows it once per visitor. */
export async function GET() {
  try {
    const r = await sql`select id, title, body, kind, cta_label, cta_url from announcements where active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()) order by created_at desc limit 1`;
    return json(r[0] || null);
  } catch { return json(null); }
}
