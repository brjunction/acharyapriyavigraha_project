/* Recordings kept on Archive.org. The database stores the lasting address of a file
   (https://archive.org/download/ITEM/FILE); the player is given our own address (/api/archive/ITEM/FILE),
   which asks Archive.org where that file is served from today and sends the player there.
   Safe to use in the browser (no database). */
const enc = (file: string) => file.split("/").map(encodeURIComponent).join("/");
export function archiveRef(u?: string | null): { item: string; file: string } | null {
  if (!u) return null;
  const m = /^https?:\/\/(?:www\.)?archive\.org\/(?:download|details)\/([^/?#]+)\/([^?#]+)/i.exec(u.trim()); if (!m) return null;
  try { return { item: decodeURIComponent(m[1]), file: decodeURIComponent(m[2]) }; } catch { return { item: m[1], file: m[2] }; }
}
export const archiveDownload = (item: string, file: string) => `https://archive.org/download/${encodeURIComponent(item)}/${enc(file)}`;
/** The address the player should use for a stored audio link. */
export function playUrl(u?: string | null): string | undefined {
  if (!u) return undefined; const r = archiveRef(u);
  return r ? `/api/archive/${encodeURIComponent(r.item)}/${enc(r.file)}` : u;
}
/** "SSGGSM1996" from a collection link (details/download/metadata) or the bare name. */
export function archiveItem(s: string) {
  const t = s.trim(); const m = /archive\.org\/(?:details|download|metadata)\/([^/?#\s]+)/i.exec(t);
  return (m ? decodeURIComponent(m[1]) : t).replace(/[^A-Za-z0-9._-]/g, "");
}
