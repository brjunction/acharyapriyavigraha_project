/** Where an article comes from — the three shelves of the Articles page. */
export const ORIGINS = [
  ["taptajivanam", "Taptajīvanam", "Articles prepared by Taptajīvanam"],
  ["guru-maharaja", "Śrīla Guru Mahārāja", "Articles by Śrīla Haladhara Swāmī"],
  ["devotees", "Devotees", "Offerings and articles from devotees"],
] as const;
export type Origin = (typeof ORIGINS)[number][0];
export const isOrigin = (x: unknown): x is Origin => ORIGINS.some((o) => o[0] === x);
