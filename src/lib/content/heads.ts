/* Headings inside a chapter's page that also appear in the book's contents (level-2 headings: "Heading" in the Studio toolbar). */
const txt = (c: any): string => (Array.isArray(c) ? c.map((x) => (typeof x === "string" ? x : x?.text ?? txt(x?.content))).join("") : "");
export const headId = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
export const blockText = (b: any) => txt(b?.content);
export function headsOf(blocks: any[]): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = []; for (const b of blocks || []) if (b?.type === "heading" && (b.props?.level || 2) <= 2) { const t = blockText(b).trim(); if (t) out.push({ id: headId(t), text: t.slice(0, 160) }); } return out.slice(0, 80);
}
let n = 0; export const newBlockId = () => `h${Date.now().toString(36)}${(n++).toString(36)}`;
export const headingBlock = (text: string, level = 2) => ({ id: newBlockId(), type: "heading", props: { level, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text, styles: {} }], children: [] });
