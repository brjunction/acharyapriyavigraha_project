import { fold, slugify } from "./text";

/** A chapter of his life. Events fall into the era whose years contain them. */
export type Era = { id: string; title: string; subtitle: string | null; year_from: number; year_to: number; summary: string | null; image: string | null; position: number };
export type LifeEvent = {
  id: string; slug: string; year: number; month: number | null; day: number | null; year_to: number | null; circa: boolean; date_label: string | null;
  title: string; summary: string | null; body: string | null; kind: string; place: string | null; country: string | null; people: string[];
  image: string | null; image_caption: string | null; links: { label: string; url: string }[]; source: string | null; importance: number; status: string; position: number;
};

export const KINDS: [string, string, string][] = [
  ["life", "Life & family", "#853500"], ["prabhupada", "With Śrīla Prabhupāda", "#b0410e"], ["vows", "Initiation & vows", "#8a5a00"],
  ["temple", "Temples & projects", "#5b6b1f"], ["travel", "Travels", "#1f5f7a"], ["preaching", "Preaching", "#6b3fa0"],
  ["festival", "Festivals", "#a3281e"], ["writing", "Books & writings", "#3b4a8a"], ["work", "Study & work", "#5a5a5a"], ["other", "Other", "#71717a"],
];
export const kindOf = (k: string) => KINDS.find((x) => x[0] === k) || KINDS[KINDS.length - 1];
export const IMPORTANCE: [number, string, string][] = [[1, "Milestone", "Shown large, and in Highlights"], [2, "Event", "A normal card"], [3, "Detail", "A single line; hidden in Highlights"]];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (m: number) => MONTHS[m - 1] || "";

/** “2 September 1929”, “c. 1940s”, “1975–1991”, or the editor’s own wording. */
export function when(e: Pick<LifeEvent, "year" | "month" | "day" | "year_to" | "circa" | "date_label">) {
  if (e.date_label) return e.date_label;
  const d = [e.day && e.month ? e.day : null, e.month ? MONTHS[e.month - 1] : null, e.year].filter(Boolean).join(" ");
  return `${e.circa ? "c. " : ""}${d}${e.year_to && e.year_to !== e.year ? `–${e.year_to}` : ""}`;
}
export const eraOf = (eras: Era[], year: number) => eras.find((x) => year >= x.year_from && year <= x.year_to) || null;

export const EVENT_COLS = ["year", "month", "day", "year_to", "circa", "date_label", "title", "summary", "body", "kind", "place", "country", "people", "image", "image_caption", "links", "source", "importance", "status", "position"];
export function cleanEvent(b: any) {
  const o: any = {};
  for (const k of EVENT_COLS) if (k in b) {
    let v = b[k]; if (v === "") v = null;
    if (["year", "month", "day", "year_to", "importance", "position"].includes(k)) v = v === null || v === undefined ? null : Number(v) || null;
    if (k === "circa") v = Boolean(v) && v !== "false" && v !== "no";
    if (k === "people") v = Array.isArray(v) ? v : String(v || "").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    if (k === "links") v = JSON.stringify(Array.isArray(v) ? v : []);
    o[k] = v;
  }
  if ("importance" in o && !o.importance) o.importance = 2; if ("position" in o && o.position === null) o.position = 0;
  return o;
}
export const eventSearch = (r: any) => fold([r.title, r.summary, r.body, r.place, r.country, ...(r.people || []), r.year, r.date_label].filter(Boolean).join(" "));

/* Shown until the first eras and events are saved in the Studio (and when the database is not reachable). */
export const SEED_ERAS: Era[] = [
  { id: "e1", title: "Early years", subtitle: "Odisha", year_from: 1929, year_to: 1973, summary: "Childhood and family life in a home devoted to Śrī Gopāl Jiu for generations.", image: "/photos/gurudeva-seated-1.webp", position: 1 },
  { id: "e2", title: "With Śrīla Prabhupāda", subtitle: "Vṛndāvana · Bhubaneswar", year_from: 1974, year_to: 1977, summary: "Meeting his beloved spiritual master, and receiving his order.", image: "/photos/gurudeva-garland.webp", position: 2 },
  { id: "e3", title: "Serving the order", subtitle: "Bhubaneswar", year_from: 1978, year_to: 1984, summary: "Building the temple his Guru asked for.", image: "/photos/gurudeva-writing.webp", position: 3 },
  { id: "e4", title: "Preaching around the world", subtitle: "Europe · Australia · Asia · America", year_from: 1985, year_to: 1995, summary: "The years from which most of his recorded lectures come.", image: "/photos/gurudeva-speaking.webp", position: 4 },
  { id: "e5", title: "Final pastimes", subtitle: "Śrīdhāma Māyāpur", year_from: 1996, year_to: 1996, summary: null, image: "/photos/gurudeva-smile.webp", position: 5 },
];
const ev = (id: string, year: number, title: string, summary: string, kind: string, importance: number, extra: Partial<LifeEvent> = {}): LifeEvent => ({ id, slug: slugify(`${year} ${title}`), year, month: null, day: null, year_to: null, circa: false, date_label: null, title, summary, body: null, kind, place: null, country: "India", people: [], image: null, image_caption: null, links: [], source: null, importance, status: "published", position: 0, ...extra });
export const SEED_EVENTS: LifeEvent[] = [
  ev("s1", 1929, "Appearance", "Born in Jagannāthapura, near Purī, Odisha, into the Giri family of Gaḍeigiri, devotees of Gopāl Jiu for generations.", "life", 1, { place: "Jagannāthapura" }),
  ev("s2", 1940, "Kīrtana gurus", "Grows up absorbed in kīrtana and the worship of Śrī Gopāl Jiu.", "life", 2, { date_label: "1940s", place: "Gaḍeigiri" }),
  ev("s3", 1974, "Meets Śrīla Prabhupāda", "Meets his beloved spiritual master in Vṛndāvana.", "prabhupada", 1, { place: "Vṛndāvana", people: ["Śrīla Prabhupāda"] }),
  ev("s4", 1975, "Initiation & sannyāsa", "Receives the order from Śrīla Prabhupāda to build a temple in Bhubaneswar.", "vows", 1, { people: ["Śrīla Prabhupāda"] }),
  ev("s5", 1975, "Building ISKCON Bhubaneswar", "Starts from a mud hut; construction of the temple of Śrī Śrī Kṛṣṇa-Balarāma.", "temple", 2, { year_to: 1991, place: "Bhubaneswar" }),
  ev("s6", 1985, "Preaching worldwide", "Travels to Europe, Australia, Indonesia and America; most recorded lectures come from these years.", "travel", 2, { year_to: 1995, country: null }),
  ev("s7", 1996, "Departure", "Departs in Śrīdhāma Māyāpur.", "life", 1, { place: "Śrīdhāma Māyāpur" }),
];


/** Columns of the Excel template, in order: [name, hint, width]. */
export const SHEET_COLS: [string, string, number][] = [["Year", "1975 (required)", 9], ["Month", "1–12, or empty", 8], ["Day", "", 6], ["Until year", "For a period: 1991", 10], ["About", "yes if the date is approximate", 8], ["Date as written", "Instead of the date: e.g. 1940s, Kārttika 1979", 20], ["Title", "Short name of the moment (required)", 34], ["Summary", "One or two lines", 48], ["Full account", "Optional longer text", 48], ["Kind", "Choose from the list", 22], ["Importance", "Milestone, Event or Detail", 12], ["Place", "", 18], ["Country", "", 12], ["People", "Separate with ;", 24], ["Picture link", "https://…", 30], ["Picture caption", "", 24], ["Source", "Where this is recorded", 26]];
