import "server-only";
import { getAcharyas, getGaudiyaBooks, getParampara, bookOf } from "./data";
import type { HubBook, HubAcharya } from "@/components/gaudiya/hub";
const KIND: Record<string, string> = { book: "Books", scripture: "Scriptures", songs: "Padyāvalī" };
/** Everything the ācārya hub needs, in one go: every Gauḍīya book (of one kind, or all) with its ācārya, and every ācārya. */
export async function hubData(kind?: string): Promise<{ books: HubBook[]; acharyas: HubAcharya[] }> {
  const [all, as, chain] = await Promise.all([getGaudiyaBooks(), getAcharyas(), getParampara()]);
  const books = all.filter((b) => !kind || (b.kind || "book") === kind).map((b, i) => { const a = as.find((x) => bookOf(b, x));
    return { slug: b.slug, title: b.title, author: a?.title || b.author || "", acharya: a?.slug || null, kind: KIND[b.kind || "book"] || "Books", category: b.category || "", chapters: b.chapters, language: b.language, order: i }; });
  return { books, acharyas: as.map((a) => ({ slug: a.slug, title: a.title, subtitle: a.subtitle, cover: a.cover, summary: a.summary, inChain: chain.some((c) => c.slug === a.slug), order: chain.findIndex((c) => c.slug === a.slug) })) };
}
