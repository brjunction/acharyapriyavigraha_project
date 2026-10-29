/** Plain text of a document (for search and descriptions). Safe on server and client. */
export function plainText(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => (c.type === "link" ? plainText(c.content) : c.type === "pageLink" ? c.props?.title || "" : c.text || "")).join("");
  if (content.type === "tableContent") return content.rows.map((r: any) => r.cells.map((c: any) => plainText(Array.isArray(c) ? c : c.content)).join(" ")).join(" ");
  return "";
}
export function docText(doc: any[], max = 155) {
  const out: string[] = [];
  const walk = (bs: any[]) => bs.forEach((b) => { out.push(plainText(b.content)); if (b.props) for (const k of ["text", "translation", "original", "transliteration", "purport", "source"]) if (typeof b.props[k] === "string") out.push(b.props[k]); if (b.type === "widget" && typeof b.props?.data === "string") { try { const d = JSON.parse(b.props.data); for (const v of Object.values(d)) if (typeof v === "string") out.push(v); } catch {} } if (b.children) walk(b.children); });
  walk(doc || []);
  return out.join(" ").replace(/\s+/g, " ").trim().slice(0, max);
}
