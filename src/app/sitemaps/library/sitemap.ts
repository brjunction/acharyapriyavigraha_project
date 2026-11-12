import type { MetadataRoute } from "next";
import { libraryUrls, libraryMapCount, PER_MAP } from "@/lib/sitemap-library";
export const revalidate = 3600;
/** /sitemaps/library/sitemap/0.xml, /1.xml … — every book, chapter, article, issue and biography, in parts of 40,000. */
export async function generateSitemaps() { const n = await libraryMapCount(); return Array.from({ length: n }, (_, id) => ({ id })); }
export default async function sitemap({ id }: { id: number | Promise<number> }): Promise<MetadataRoute.Sitemap> {
  const k = Number(await id) || 0; const all = await libraryUrls();
  return all.slice(k * PER_MAP, (k + 1) * PER_MAP).map((u) => ({ url: u.url, lastModified: u.lastModified, priority: u.priority, changeFrequency: "monthly" as const }));
}
