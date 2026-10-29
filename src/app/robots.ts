import type { MetadataRoute } from "next";
import { SITE } from "@/lib/cms/render";
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }], sitemap: `${SITE}/sitemap.xml` }; }
