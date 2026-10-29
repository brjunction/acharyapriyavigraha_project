export type Block = { id: string; type: string; data: Record<string, any> };
export const uid = () => Math.random().toString(36).slice(2, 10);

export const TONES = ["saffron", "teal", "indigo", "rose", "leaf", "gold", "plum"] as const;
export const DIVIDERS = [
  ["line", "Simple line"], ["border-1", "Indic border 1"], ["border-2", "Indic border 2"], ["border-3", "Indic border 3"], ["border-4", "Indic border 4"], ["border-5", "Indic border 5"], ["lotus", "Lotus"],
] as const;

export type BlockDef = { type: string; label: string; hint: string; icon: string; make: () => Block };
const b = (type: string, data: Record<string, any>): Block => ({ id: uid(), type, data });

export const BLOCKS: BlockDef[] = [
  { type: "heading", label: "Heading", hint: "A title for a section", icon: "Heading", make: () => b("heading", { text: "A new heading", level: 2, align: "left", tone: "saffron", rule: true }) },
  { type: "text", label: "Text", hint: "A paragraph, with bold, links and lists", icon: "Type", make: () => b("text", { html: "<p>Start writing here…</p>", align: "left", size: "md" }) },
  { type: "image", label: "Image", hint: "A picture with a caption and a border", icon: "Image", make: () => b("image", { src: "", alt: "", caption: "", width: "wide", align: "center", frame: "none" }) },
  { type: "gallery", label: "Gallery", hint: "Several pictures in a grid", icon: "LayoutGrid", make: () => b("gallery", { images: [], cols: 3, frame: "none" }) },
  { type: "quote", label: "Quote", hint: "A quotation with its source", icon: "Quote", make: () => b("quote", { text: "A quotation goes here.", source: "Śrīla Gurudeva, Lecture, place and date", style: "card" }) },
  { type: "callout", label: "Highlight box", hint: "A coloured box that stands out", icon: "Sparkles", make: () => b("callout", { html: "<p>Something worth noticing.</p>", tone: "saffron" }) },
  { type: "cards", label: "Cards", hint: "A row of linked cards", icon: "Columns3", make: () => b("cards", { items: [{ title: "Card title", text: "A short line.", href: "/", tone: "saffron" }, { title: "Another card", text: "A short line.", href: "/", tone: "teal" }, { title: "A third card", text: "A short line.", href: "/", tone: "rose" }] }) },
  { type: "columns", label: "Two columns", hint: "Text beside a picture, or two texts", icon: "Columns2", make: () => b("columns", { left: "<p>Left column</p>", right: "<p>Right column</p>", leftImage: "", rightImage: "", split: "even" }) },
  { type: "database", label: "Database list", hint: "Show rows from one of your databases", icon: "Database", make: () => b("database", { db: "", view: "list", limit: 12, title: "" }) },
  { type: "video", label: "Video", hint: "A YouTube video", icon: "Play", make: () => b("video", { url: "", caption: "" }) },
  { type: "audio", label: "Audio", hint: "An audio link with a player", icon: "Headphones", make: () => b("audio", { url: "", title: "" }) },
  { type: "button", label: "Button", hint: "A button that opens a page", icon: "MousePointerClick", make: () => b("button", { label: "Open", href: "/", tone: "saffron", align: "left" }) },
  { type: "divider", label: "Divider", hint: "A line or an Indian border", icon: "Minus", make: () => b("divider", { style: "border-4" }) },
  { type: "spacer", label: "Space", hint: "Empty space", icon: "MoveVertical", make: () => b("spacer", { h: 40 }) },
  { type: "toc", label: "Contents list", hint: "Links to the headings on this page", icon: "ListTree", make: () => b("toc", {}) },
];
export const blockDef = (t: string) => BLOCKS.find((x) => x.type === t);

/** Page templates: what a new page starts with. */
export type Template = { key: string; name: string; desc: string; type: "page" | "book" | "chapter" | "collection" | "landing"; blocks: () => Block[] };
const H = (text: string, level = 2) => b("heading", { text, level, align: "left", tone: "saffron", rule: true });
const T = (html: string) => b("text", { html, align: "left", size: "md" });
export const TEMPLATES: Template[] = [
  { key: "blank", name: "Blank page", desc: "Start from nothing.", type: "page", blocks: () => [H("Page title", 1), T("<p>Start writing here…</p>")] },
  { key: "article", name: "Article", desc: "A title, an introduction and sections to read.", type: "page", blocks: () => [H("Title of the article", 1), T("<p><em>A short introduction.</em></p>"), H("First section"), T("<p>Write here…</p>"), b("divider", { style: "border-4" }), H("Second section"), T("<p>Write here…</p>")] },
  { key: "biography", name: "Life story", desc: "A story told in sections, with pictures.", type: "page", blocks: () => [H("His life", 1), b("image", { src: "", alt: "", caption: "", width: "wide", align: "center", frame: "indic" }), T("<p>Begin the story…</p>"), b("callout", { html: "<p>A moment worth remembering.</p>", tone: "gold" })] },
  { key: "gallery", name: "Photo gallery", desc: "A grid of photographs with captions.", type: "page", blocks: () => [H("Gallery", 1), T("<p>A few words about these pictures.</p>"), b("gallery", { images: [], cols: 3, frame: "gold" })] },
  { key: "quotes", name: "Quotes page", desc: "A collection of quotations with sources.", type: "page", blocks: () => [H("Quotations", 1), b("quote", { text: "A quotation goes here.", source: "Source", style: "card" }), b("quote", { text: "Another quotation.", source: "Source", style: "card" })] },
  { key: "landing", name: "Landing page", desc: "A welcome page with cards that lead to other pages.", type: "landing", blocks: () => [H("Welcome", 1), T("<p>An opening line.</p>"), b("cards", { items: [{ title: "First", text: "A short line.", href: "/", tone: "saffron" }, { title: "Second", text: "A short line.", href: "/", tone: "teal" }, { title: "Third", text: "A short line.", href: "/", tone: "rose" }] })] },
  { key: "book", name: "Book", desc: "A book whose chapters can hold more chapters, as deep as you need.", type: "book", blocks: () => [H("Book title", 1), T("<p>About this book: author, publisher, year.</p>")] },
  { key: "chapter", name: "Chapter", desc: "A chapter inside a book. Chapters can contain chapters.", type: "chapter", blocks: () => [H("Chapter title", 1), T("<p>Write the chapter here…</p>")] },
  { key: "collection", name: "Collection / index", desc: "A page that lists everything inside it.", type: "collection", blocks: () => [H("Collection", 1), T("<p>An introduction to this collection.</p>")] },
  { key: "database", name: "Database page", desc: "A page that shows a table of your own records.", type: "page", blocks: () => [H("Records", 1), b("database", { db: "", view: "table", limit: 50, title: "" })] },
];
export const template = (k: string) => TEMPLATES.find((t) => t.key === k) || TEMPLATES[0];

export const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "page";

/** Sanitise rich text: keep a small safe set of tags and attributes. */
export function clean(html: string): string {
  const allowed = new Set(["p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "span", "sub", "sup", "hr"]);
  return String(html || "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (m, tag: string, attrs: string) => {
      const t = tag.toLowerCase(); if (!allowed.has(t)) return "";
      if (m.startsWith("</")) return `</${t}>`;
      if (t === "a") { const h = /href\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] || ""; return /^(https?:|\/|mailto:|#)/i.test(h) ? `<a href="${h.replace(/"/g, "&quot;")}" rel="noopener">` : "<a>"; }
      if (t === "span") { const c = /color\s*:\s*(#[0-9a-f]{3,8}|[a-z]+)/i.exec(attrs)?.[1]; const al = /text-align\s*:\s*(left|center|right|justify)/i.exec(attrs)?.[1]; return `<span${c || al ? ` style="${c ? `color:${c};` : ""}${al ? `text-align:${al}` : ""}"` : ""}>`; }
      if (t === "p" || t.startsWith("h") || t === "li" || t === "blockquote") { const al = /text-align\s*:\s*(left|center|right|justify)/i.exec(attrs)?.[1]; return `<${t}${al ? ` style="text-align:${al}"` : ""}>`; }
      return `<${t}>`;
    });
}
