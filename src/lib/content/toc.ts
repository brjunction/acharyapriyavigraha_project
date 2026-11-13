/** An issue's contents as sent from the Studio: up to 60 {title, page}, checked. Returns JSON text for a jsonb column, or null. */
export function cleanToc(x: unknown): string | null {
  if (!Array.isArray(x)) return null;
  const out = x.slice(0, 60).map((t: any) => ({ title: String(t?.title || "").replace(/\s+/g, " ").trim().slice(0, 160), page: Math.max(1, Math.min(2000, Math.floor(Number(t?.page) || 0))) })).filter((t) => t.title && t.page);
  return out.length ? JSON.stringify(out) : null;
}
