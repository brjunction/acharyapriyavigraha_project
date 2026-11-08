/* Editor blocks ⇄ simple Markdown on the server (headings, paragraphs, quotes, lists, bold and italic) — for batch work with the AI. */
let n = 0; const id = () => `m${Date.now().toString(36)}${(n++).toString(36)}`;
const inlineToMd = (c: any): string => (Array.isArray(c) ? c : []).map((x: any) => { if (typeof x === "string") return x; if (x.type === "link") return inlineToMd(x.content); const t = String(x.text || ""); if (!t) return ""; const s = x.styles || {}; return s.bold && s.italic ? `***${t}***` : s.bold ? `**${t}**` : s.italic ? `*${t}*` : t; }).join("");
export function blocksToMd(blocks: any[]): string {
  const out: string[] = [];
  for (const b of blocks || []) {
    const t = inlineToMd(b.content);
    if (b.type === "heading") out.push(`${"#".repeat(Math.min(3, b.props?.level || 2))} ${t}`);
    else if (b.type === "quote") out.push(t.split("\n").map((l) => `> ${l}`).join("\n"));
    else if (b.type === "bulletListItem") out.push(`- ${t}`);
    else if (b.type === "numberedListItem") out.push(`1. ${t}`);
    else if (t.trim()) out.push(t);
    if (b.children?.length) out.push(blocksToMd(b.children));
  }
  return out.join("\n\n");
}
export function mdInline(s: string): any[] {
  const parts: any[] = []; const re = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g; let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(s))) { if (m.index > last) parts.push({ type: "text", text: s.slice(last, m.index), styles: {} }); const x = m[0]; const k = x.startsWith("***") ? 3 : x.startsWith("**") ? 2 : 1; parts.push({ type: "text", text: x.slice(k, -k), styles: k === 3 ? { bold: true, italic: true } : k === 2 ? { bold: true } : { italic: true } }); last = m.index + x.length; }
  if (last < s.length) parts.push({ type: "text", text: s.slice(last), styles: {} });
  return parts;
}
export function mdToBlocks(md: string): any[] {
  const out: any[] = []; const chunks = String(md || "").replace(/\r/g, "").split(/\n\s*\n/);
  for (const raw of chunks) {
    const c = raw.trim(); if (!c) continue;
    const h = /^(#{1,6})\s+(.*)$/.exec(c);
    if (h && !c.includes("\n")) { out.push({ id: id(), type: "heading", props: { level: Math.min(3, h[1].length) }, content: mdInline(h[2]), children: [] }); continue; }
    if (c.split("\n").every((l) => /^>\s?/.test(l))) { out.push({ id: id(), type: "quote", props: {}, content: mdInline(c.split("\n").map((l) => l.replace(/^>\s?/, "")).join("\n")), children: [] }); continue; }
    if (c.split("\n").every((l) => /^([-*]|\d+\.)\s+/.test(l))) { for (const l of c.split("\n")) out.push({ id: id(), type: /^\d+\./.test(l) ? "numberedListItem" : "bulletListItem", props: {}, content: mdInline(l.replace(/^([-*]|\d+\.)\s+/, "")), children: [] }); continue; }
    out.push({ id: id(), type: "paragraph", props: {}, content: mdInline(c.replace(/\n/g, " ")), children: [] });
  }
  return out;
}
