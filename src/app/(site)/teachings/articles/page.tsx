import { Suspense } from "react";
import { cmsOverride } from "@/lib/cms/render";
import { allArticles, allAuthors } from "@/lib/content/articles-public";
import { WritingsHeader } from "@/components/articles/header";
import { ArticleLibrary } from "@/components/articles/library";

export const revalidate = 300;
export const metadata = { title: "Articles", description: "Articles by Śrī Śrīmad Gour Govinda Swāmī Gurudeva, his disciples and others — by author, section and series." };

export default async function Page() {
  const cms = await cmsOverride("/teachings/articles"); if (cms) return cms;
  const [items, authors] = await Promise.all([allArticles(), allAuthors()]);
  return (
    <>
      <WritingsHeader at="/teachings/articles" title="Articles" intro="Essays, compilations and write-ups — by Śrīla Gurudeva, Śrīla Guru Mahārāja and many others." stats={[`${items.length.toLocaleString()} articles`, `${authors.length} authors`]} />
      <Suspense><ArticleLibrary items={items} authors={authors} /></Suspense>
    </>
  );
}
