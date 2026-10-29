/* The Library: collections with a fixed, systematic structure. Editors can add their own extra columns, but these stay. */
type F = { key: string; label: string; type: string; options?: { name: string; color: string }[]; relation?: string; system: true };
const f = (key: string, label: string, type: string, extra: Partial<F> = {}): F => ({ key, label, type, system: true, ...extra });
const o = (...names: string[]) => names.map((name, i) => ({ name, color: ["orange", "blue", "green", "pink", "yellow", "purple", "brown", "gray", "red"][i % 9] }));
const SOURCE = [f("source", "Source (lecture, place, date)", "text"), f("lecture", "From lecture", "relation", { relation: "audio-lectures" }), f("time", "Time in the lecture (mm:ss)", "text"), f("topics", "Topics", "multi"), f("verse", "Verse", "text")];

export type LibraryDef = { slug: string; name: string; icon: string; group: string; description: string; route: string; fields: F[]; views: any[] };
export const LIBRARY: LibraryDef[] = [
  { slug: "audio-lectures", name: "Audio lectures", icon: "🎧", group: "Hear & watch", route: "/teachings/audio", description: "Every recorded lecture. Fill Date, Place, Verse and Topics so visitors can filter.",
    fields: [f("date", "Date", "date"), f("place", "Place", "select"), f("country", "Country", "select"), f("type", "Kind", "select", { options: o("Lecture", "Darśana", "Festival", "Questions & answers", "House program", "Initiation") }), f("verse", "Verse", "text"),
      f("topics", "Topics", "multi"), f("languages", "Language", "multi", { options: o("English", "Odia", "Hindi", "Bengali") }), f("series", "Series", "select"), f("duration", "Duration (minutes)", "number"), f("audio", "Audio", "audio"), f("transcribed", "Transcribed", "checkbox"), f("transcript", "Transcript (link)", "url")],
    views: [{ id: "all", name: "All lectures", type: "table", filters: [], sorts: [{ key: "date", dir: "desc" }] }, { id: "cal", name: "Calendar", type: "calendar", filters: [], sorts: [], dateKey: "date" }] },
  { slug: "videos", name: "Videos", icon: "🎬", group: "Hear & watch", route: "/teachings/videos", description: "Videos. Paste a YouTube link in Video, or import from a YouTube channel.",
    fields: [f("date", "Date", "date"), f("video", "Video", "video"), f("category", "Category", "select", { options: o("Lecture", "Kīrtana", "Daily diary", "Festival", "Documentary") }), f("place", "Place", "select"), f("topics", "Topics", "multi"), f("languages", "Language", "multi"), f("channel", "Channel", "select")],
    views: [{ id: "all", name: "All videos", type: "gallery", filters: [], sorts: [{ key: "date", dir: "desc" }] }, { id: "table", name: "Table", type: "table", filters: [], sorts: [] }] },
  { slug: "kirtans", name: "Kīrtanas & bhajanas", icon: "🎵", group: "Hear & watch", route: "/teachings/kirtans", description: "Songs he sang and led.",
    fields: [f("date", "Date", "date"), f("audio", "Audio", "audio"), f("video", "Video", "video"), f("song", "Song / bhajana", "text"), f("author", "Written by", "select"), f("place", "Place", "select"), f("lyrics", "Words", "text")],
    views: [{ id: "all", name: "All", type: "table", filters: [], sorts: [] }] },
  { slug: "quotes", name: "Quotes", icon: "💬", group: "Compilations", route: "/teachings/quotes", description: "Short quotations taken from the lectures, each with its exact source.",
    fields: [f("text", "Quote", "text"), ...SOURCE], views: [{ id: "all", name: "All quotes", type: "list", filters: [], sorts: [] }, { id: "topics", name: "By topic", type: "board", filters: [], sorts: [], groupBy: "topics" }] },
  { slug: "verses", name: "Verses", icon: "📜", group: "Compilations", route: "/teachings/verses", description: "Verses he quoted, with the original, transliteration and translation.",
    fields: [f("reference", "Reference (e.g. BG 2.13)", "text"), f("scripture", "Scripture", "select", { options: o("Bhagavad-gītā", "Śrīmad-Bhāgavatam", "Caitanya-caritāmṛta", "Other") }), f("devanagari", "Original (Devanāgarī / Bengali)", "text"), f("transliteration", "Transliteration", "text"), f("translation", "Translation", "text"), f("comment", "His explanation", "text"), f("topics", "Topics", "multi"), f("lecture", "Quoted in lecture", "relation", { relation: "audio-lectures" })],
    views: [{ id: "all", name: "All verses", type: "table", filters: [], sorts: [{ key: "reference", dir: "asc" }] }, { id: "by", name: "By scripture", type: "board", filters: [], sorts: [], groupBy: "scripture" }] },
  { slug: "stories", name: "Stories & anecdotes", icon: "📖", group: "Compilations", route: "/teachings/stories", description: "Stories and analogies he told.",
    fields: [f("text", "Story", "text"), f("kind", "Kind", "select", { options: o("Story", "Anecdote", "Analogy", "Pastime") }), ...SOURCE], views: [{ id: "all", name: "All stories", type: "list", filters: [], sorts: [] }] },
  { slug: "instructions", name: "Instructions", icon: "🪔", group: "Compilations", route: "/teachings/instructions", description: "Guidance for sādhana and life.",
    fields: [f("text", "Instruction", "text"), ...SOURCE], views: [{ id: "all", name: "All", type: "list", filters: [], sorts: [] }] },
  { slug: "desires", name: "Desires", icon: "🌺", group: "Compilations", route: "/teachings/desires", description: "His heart’s wishes, in his own words.",
    fields: [f("text", "Desire", "text"), ...SOURCE], views: [{ id: "all", name: "All", type: "list", filters: [], sorts: [] }] },
  { slug: "nectar-drops", name: "Nectar drops", icon: "💧", group: "Compilations", route: "/teachings/nectar-drops", description: "A short gem for every day.",
    fields: [f("text", "Nectar drop", "text"), f("day", "Day of the year", "date"), ...SOURCE], views: [{ id: "all", name: "All", type: "calendar", filters: [], sorts: [], dateKey: "day" }, { id: "list", name: "List", type: "list", filters: [], sorts: [] }] },
  { slug: "letters", name: "Letters", icon: "✉️", group: "Read", route: "/gurudeva/letters", description: "His letters, and letters to him.",
    fields: [f("date", "Date", "date"), f("from", "From", "select"), f("to", "To", "select"), f("place", "Written at", "select"), f("text", "Letter", "text"), f("scan", "Scan", "file"), f("topics", "Topics", "multi")],
    views: [{ id: "all", name: "All letters", type: "table", filters: [], sorts: [{ key: "date", dir: "desc" }] }] },
];
export const LIB_BY_ROUTE = Object.fromEntries(LIBRARY.map((l) => [l.route, l]));
export const isLibrary = (slug: string) => LIBRARY.some((l) => l.slug === slug);
