export type FSection = { id?: string; title: string; source: string; enabled: boolean; position: number };
export const SOURCES: [string, string][] = [
  ["menu:gurudeva", "Śrīla Gurudeva (pages of this menu)"], ["menu:teachings", "His Teachings (pages of this menu)"], ["menu:resources", "Resources (pages of this menu)"], ["menu:about", "About (pages of this menu)"],
  ["audios", "Audio lectures, by year and month"], ["transcripts", "Transcriptions, by year"], ["kirtans", "Kīrtanas & bhajanas"], ["videos", "Videos, by kind"], ["books", "Books and their chapters"], ["excerpts", "Compilations (quotes, verses, stories…)"], ["pages", "Other pages"],
];
export const DEFAULT_SECTIONS: FSection[] = [
  { title: "Śrīla Gurudeva", source: "menu:gurudeva", enabled: true, position: 0 }, { title: "Audio lectures", source: "audios", enabled: true, position: 1 },
  { title: "Transcriptions", source: "transcripts", enabled: true, position: 2 }, { title: "Kīrtanas & bhajanas", source: "kirtans", enabled: true, position: 3 },
  { title: "Videos", source: "videos", enabled: true, position: 4 }, { title: "Books", source: "books", enabled: true, position: 5 },
  { title: "Compilations", source: "excerpts", enabled: true, position: 6 }, { title: "His Teachings", source: "menu:teachings", enabled: true, position: 7 },
  { title: "Resources", source: "menu:resources", enabled: false, position: 8 }, { title: "About", source: "menu:about", enabled: true, position: 9 },
];
