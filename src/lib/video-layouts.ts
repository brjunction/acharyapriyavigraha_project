/* The designs and colours a Videos section can have (shared by the Studio and the site). */
export const LAYOUTS = [
  ["featured", "Featured — one big video, a list beside it"],
  ["spotlight", "Spotlight — a wide banner video, a row below"],
  ["row", "Row — a row that swipes sideways"],
  ["grid", "Grid — neat tiles"],
  ["shorts", "Shorts — tall cards that play one after another"],
  ["playlists", "Playlists — one card for each playlist"],
  ["carousel", "Carousel — big slides that change by themselves"],
  ["list", "List — a neat numbered list"],
  ["channels", "Channels — channel cards with their pictures"],
  ["folder", "Folder — holds sub-sections, one below another"],
  ["tabs", "Tabs — sub-sections as switchable tabs inside"],
] as const;
/** Whether a section can be folded: no, open at first, or closed at first. */
export const FOLDS = [["none", "Always open"], ["open", "Foldable, open at first"], ["closed", "Foldable, closed at first"]] as const;
export type Layout = (typeof LAYOUTS)[number][0];
export const COLORS = ["saffron", "rose", "teal", "indigo", "leaf", "gold", "plum"] as const;
/** Lengths for the advanced video search: key, label, from (seconds), to. */
export const LENGTHS: [string, string, number, number][] = [["short", "Under 1 min", 0, 61], ["5", "1–5 min", 61, 301], ["20", "5–20 min", 301, 1201], ["60", "20–60 min", 1201, 3601], ["long", "Over 1 hour", 3601, 1e9]];

/** The watch address of a video (usable on the server and in the browser). */
export const watchHref = (v: { slug: string }, q?: string) => `/teachings/videos/${v.slug}${q ? `?${q}` : ""}`;

/** A YouTube title made calm for reading here: no hashtags or emoji, "||" and "|" shown as a quiet dot. */
export function cleanTitle(t: string) {
  const raw = String(t || "");
  let s = raw.replace(/(^|\s)#[\p{L}\p{N}_]+/gu, " ").replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s*\|\|?\s*/g, " · ").replace(/\s{2,}/g, " ").replace(/^[\s·\-–|]+|[\s·\-–|]+$/g, "").trim();
  if (!s) s = raw.replace(/#/g, " ").replace(/\s{2,}/g, " ").trim();
  return s;
}
