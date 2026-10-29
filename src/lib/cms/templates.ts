/* Starting content for new pages, in the editor's block format. */
type B = { type: string; props?: Record<string, any>; content?: any; children?: B[] };
const t = (text: string) => [{ type: "text", text, styles: {} }];
const h = (text: string, level = 2): B => ({ type: "heading", props: { level }, content: t(text) });
const p = (text = ""): B => ({ type: "paragraph", content: text ? t(text) : [] });

export type PageTemplate = { key: string; name: string; desc: string; icon: string; type: "page" | "book" | "chapter" | "collection"; blocks: () => B[] };
export const PAGE_TEMPLATES: PageTemplate[] = [
  { key: "blank", name: "Empty page", desc: "Start writing. Press / for every element.", icon: "📄", type: "page", blocks: () => [p()] },
  { key: "article", name: "Article", desc: "Introduction, sections and a closing quote.", icon: "📝", type: "page", blocks: () => [p("A short introduction to this article."), h("First section"), p("Write here…"), h("Second section"), p("Write here…"), { type: "pullQuote", props: { source: "Source of the quote" }, content: t("A quotation that sums it up.") }] },
  { key: "biography", name: "Life story", desc: "A life told in chapters, with pictures and a timeline.", icon: "🪷", type: "page", blocks: () => [{ type: "callout", props: { tone: "orange", icon: "🪷" }, content: t("A few words to introduce this life.") }, h("Early life"), p(), { type: "image", props: { url: "" } }, h("Service"), p(), h("Remembrance"), p()] },
  { key: "book", name: "Book", desc: "A book. Add chapters inside it, and chapters inside chapters.", icon: "📖", type: "book", blocks: () => [p("About this book: author, publisher, year."), { type: "toc", props: {} }] },
  { key: "chapter", name: "Chapter", desc: "A chapter of a book.", icon: "📑", type: "chapter", blocks: () => [p("Write the chapter here…")] },
  { key: "gallery", name: "Photo gallery", desc: "A grid of photographs with captions.", icon: "🖼️", type: "page", blocks: () => [p("A few words about these pictures."), { type: "gallery", props: { images: "[]", cols: 3 } }] },
  { key: "quotes", name: "Quotes", desc: "Quotations, each with its source.", icon: "💬", type: "page", blocks: () => [{ type: "pullQuote", props: { source: "Lecture, place, date" }, content: t("A quotation.") }, { type: "pullQuote", props: { source: "Lecture, place, date" }, content: t("Another quotation.") }] },
  { key: "collection", name: "Collection", desc: "A section that lists the pages inside it.", icon: "🗂️", type: "collection", blocks: () => [p("An introduction to this collection.")] },
  { key: "database", name: "Database page", desc: "A page showing one of your databases.", icon: "🗃️", type: "page", blocks: () => [p(), { type: "database", props: { db: "", view: "table", title: "", limit: 50 } }] },
];
export const pageTemplate = (k: string) => PAGE_TEMPLATES.find((x) => x.key === k) || PAGE_TEMPLATES[0];
