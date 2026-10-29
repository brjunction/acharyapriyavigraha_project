import type { MetadataRoute } from "next";
import { sql, hasDb } from "@/lib/db";
import { SITE } from "@/lib/cms/render";
import { ROUTES } from "@/components/cms/collection";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = ["", "/gurudeva", "/teachings", "/resources", "/about", "/translations", "/thank-list"].map((p) => ({ url: SITE + p, changeFrequency: "weekly", priority: p ? 0.7 : 1 }));
  if (!hasDb()) return base;
  try {
    const pages = await sql`select path, updated_at from pages where status='published' and coalesce((seo->>'noindex')::boolean,false) = false`;
    const rows = await sql`select d.slug as db, r.slug, r.updated_at from db_rows r join dbs d on d.id = r.db_id where r.status='published' and d.public and r.slug is not null limit 40000`;
    const audios = await sql`select slug, updated_at from audios where status = 'published' limit 30000`;
    const kindRoute = Object.fromEntries(Object.entries(ROUTES).filter(([, r]) => r.table === "excerpts").map(([route, r]) => [r.kind, route]));
    const ex = await sql`select kind, slug, updated_at from excerpts where status = 'published' limit 40000`;
    const extra = [...audios.map((a) => ({ url: `${SITE}/teachings/audio/${a.slug}`, lastModified: a.updated_at as string, priority: 0.6 })), ...ex.filter((e) => kindRoute[e.kind as string]).map((e) => ({ url: `${SITE}${kindRoute[e.kind as string]}/${e.slug}`, lastModified: e.updated_at as string, priority: 0.5 }))];
    return [...base, ...extra, ...pages.map((p) => ({ url: SITE + p.path, lastModified: p.updated_at as string, priority: 0.6 })), ...rows.map((r) => ({ url: `${SITE}/d/${r.db}/${r.slug}`, lastModified: r.updated_at as string, priority: 0.5 }))];
  } catch { return base; }
}
