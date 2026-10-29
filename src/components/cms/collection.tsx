/* Public page for a Library collection (quotes, verses, stories, videos, letters…). Server part. */
import { PageHero } from "@/components/ui";
import { dbRows } from "@/lib/cms/library";
import { LIBRARY } from "@/lib/cms/library-defs";
import { CollectionBrowser, type Item } from "./collection-browser";

export async function collectionFor(route: string) {
  const def = LIBRARY.find((l) => l.route === route); if (!def) return null;
  const d = await dbRows(def.slug); if (!d || !d.rows.length) return null;
  return { def, d };
}

export async function CollectionPage({ route, crumbs }: { route: string; crumbs: { href?: string; label: string }[] }) {
  const c = await collectionFor(route); if (!c) return null;
  const { def, d } = c;
  const lectures = d.fields.some((f) => f.type === "relation") ? await dbRows("audio-lectures") : null;
  const lt = Object.fromEntries((lectures?.rows || []).map((r: any) => [r.slug, r.title]));
  const items: Item[] = d.rows.map((r) => ({ title: r.title, slug: r.slug, data: r.data }));
  const facets = d.fields.filter((f) => f.type === "select" || f.type === "multi").map((f) => ({ key: f.key, label: f.label }));
  return (
    <>
      <PageHero crumbs={crumbs} title={def.name} intro={def.description} />
      <CollectionBrowser kind={def.slug} db={d.slug} items={items} facets={facets} dateKey={d.fields.find((f) => f.type === "date")?.key} lectureTitles={lt} />
    </>
  );
}
