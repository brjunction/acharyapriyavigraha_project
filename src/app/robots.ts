import type { MetadataRoute } from "next";
import { SITE } from "@/lib/cms/render";
import { libraryMapCount } from "@/lib/sitemap-library";
export const revalidate = 3600;
/** Everything public may be indexed; the Studio may not. The library sitemaps list every book page and chapter. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const n = await libraryMapCount();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }], sitemap: [`${SITE}/sitemap.xml`, ...Array.from({ length: n }, (_, i) => `${SITE}/sitemaps/library/sitemap/${i}.xml`)] };
}
