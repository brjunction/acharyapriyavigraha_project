"use client";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { SuggestionMenuController, getDefaultReactSlashMenuItems, useCreateBlockNote, type DefaultReactSuggestionItem } from "@blocknote/react";
import { FileText, Database, Sparkles, Quote, ScrollText, Youtube, LayoutGrid, MousePointerClick, Minus, ListTree, BookOpen, Milestone, BookMarked, PanelLeft, LayoutTemplate, MessageCircleQuestion, BarChart3, Flag, Headphones } from "lucide-react";
import { schema, type Editor } from "./schema";
import { icons } from "lucide-react";
import { WIDGETS } from "@/lib/cms/widget-defs";
import { api } from "../ui";

async function upload(file: File) {
  const fd = new FormData(); fd.append("file", file);
  const r = await api<{ url: string }>("/api/admin/media", "POST", fd);
  return r.url;
}

function customItems(editor: Editor, pageId: string): DefaultReactSuggestionItem[] {
  const G = "Taptajīvanam";
  const ins = (b: any) => insertOrUpdateBlockForSlashMenu(editor, b);
  return [
    { title: "Page", subtext: "A new page inside this one", aliases: ["page", "subpage", "child"], group: "Pages", icon: <FileText size={18} />,
      onItemClick: async () => { const r = await api<{ id: string }>("/api/admin/pages", "POST", { parent_id: pageId, template: "blank" }); ins({ type: "subpage", props: { pageId: r.id } }); window.dispatchEvent(new Event("tj:pages-changed")); } },
    { title: "Database", subtext: "A table of records, shown as table, list, gallery or board", aliases: ["db", "table view", "board", "gallery"], group: "Pages", icon: <Database size={18} />, onItemClick: () => ins({ type: "database" }) },
    { title: "Table of contents", subtext: "Headings of this page, or chapters of a book", aliases: ["toc", "contents"], group: "Pages", icon: <ListTree size={18} />, onItemClick: () => ins({ type: "toc" }) },
    { title: "Timeline", subtext: "Events by year, with a line and markers", aliases: ["timeline", "history", "years"], group: G, icon: <Milestone size={18} />, onItemClick: () => ins({ type: "timeline" }) },
    { title: "Verse with translation", subtext: "Original, transliteration, translation and explanation", aliases: ["verse", "sloka", "shloka", "translation"], group: G, icon: <BookMarked size={18} />, onItemClick: () => ins({ type: "verse" }) },
    { title: "Picture beside text", subtext: "A picture on one side, writing on the other", aliases: ["image text", "side", "media"], group: G, icon: <PanelLeft size={18} />, onItemClick: () => ins({ type: "imageText" }) },
    { title: "Link cards", subtext: "Cards with pictures that open other pages", aliases: ["cards", "links", "grid"], group: G, icon: <LayoutTemplate size={18} />, onItemClick: () => ins({ type: "linkCards" }) },
    { title: "Questions & answers", subtext: "Questions that open to show the answer", aliases: ["faq", "question", "answer", "accordion"], group: G, icon: <MessageCircleQuestion size={18} />, onItemClick: () => ins({ type: "faq" }) },
    { title: "Numbers", subtext: "A row of big numbers with labels", aliases: ["stats", "numbers", "counter"], group: G, icon: <BarChart3 size={18} />, onItemClick: () => ins({ type: "stats" }) },
    { title: "Banner", subtext: "A wide coloured band with a title and a button", aliases: ["banner", "hero", "cta"], group: G, icon: <Flag size={18} />, onItemClick: () => ins({ type: "banner" }) },
    { title: "Callout", subtext: "A coloured box with an icon", aliases: ["note", "info", "box"], group: G, icon: <Sparkles size={18} />, onItemClick: () => ins({ type: "callout" }) },
    { title: "Śloka / verse", subtext: "A verse, centred, with its source", aliases: ["sloka", "verse", "sanskrit"], group: G, icon: <ScrollText size={18} />, onItemClick: () => ins({ type: "sloka" }) },
    { title: "Quote card", subtext: "A quotation with its source, in a card", aliases: ["quote", "pull"], group: G, icon: <Quote size={18} />, onItemClick: () => ins({ type: "pullQuote" }) },
    { title: "YouTube", subtext: "Embed a YouTube video or short", aliases: ["youtube", "video", "embed"], group: G, icon: <Youtube size={18} />, onItemClick: () => ins({ type: "youtube" }) },
    { title: "Gallery", subtext: "A grid of pictures", aliases: ["photos", "images", "grid"], group: G, icon: <LayoutGrid size={18} />, onItemClick: () => ins({ type: "gallery" }) },
    { title: "Button", subtext: "A button that links somewhere", aliases: ["link", "cta"], group: G, icon: <MousePointerClick size={18} />, onItemClick: () => ins({ type: "button" }) },
    { title: "Ornament divider", subtext: "A decorative line between sections", aliases: ["divider", "ornament", "line"], group: G, icon: <Minus size={18} />, onItemClick: () => ins({ type: "ornament" }) },
    ...WIDGETS.map((w) => { const I = (icons as any)[w.icon] || icons.Sparkles; return { title: w.title, subtext: w.hint, aliases: w.aliases || [], group: w.group, icon: <I size={18} />, onItemClick: () => ins({ type: "widget", props: { kind: w.kind, data: JSON.stringify(w.data) } }) }; }),
  ];
}

export default function NotionEditor({ initial, pageId, onChange, editable = true }: { initial: any[]; pageId: string; onChange: (blocks: any[]) => void; editable?: boolean }) {
  const editor = useCreateBlockNote({ schema, initialContent: initial?.length ? initial : undefined, uploadFile: upload }) as Editor;
  return (
    <BlockNoteView editor={editor} editable={editable} theme="light" slashMenu={false} className="tj-editor" onChange={() => onChange(editor.document as any[])}>
      <SuggestionMenuController triggerCharacter="/" getItems={async (q) => filterSuggestionItems([...getDefaultReactSlashMenuItems(editor), ...customItems(editor, pageId)], q)} />
    </BlockNoteView>
  );
}
