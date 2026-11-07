/* File names and place codes for recordings (no database; used in the Studio too). */
import { fold } from "./text";

const BOOK: Record<string, string> = { SB: "Bhagavatam", BG: "Gita", CC: "Caitanya-caritamrta", NOI: "Nectar-of-Instruction", ISO: "Isopanisad", BS: "Brahma-samhita" };
const LILA = ["Adi", "Madhya", "Antya"];
/** Short place codes used in the archive; other places get four letters of their own. */
const PLACE: Record<string, string> = { bhubaneswar: "BBSR", puri: "PURI", "jagannatha puri": "PURI", mayapur: "MYPR", vrndavana: "VRN", vrindavan: "VRN", cuttack: "CTC", kolkata: "KOL", calcutta: "KOL", delhi: "DEL", "new delhi": "DEL", mumbai: "BOM", bombay: "BOM", gadeigiri: "GDG", radhadesh: "RDH", murwillumbah: "MWB", "san francisco": "SF", "los angeles": "LA", "new york": "NY", london: "LON", paris: "PAR", amsterdam: "AMS", moscow: "MOS", sydney: "SYD", melbourne: "MEL", bali: "BALI", jakarta: "JKT" };
const word = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join("-");

export function placeCode(place?: string | null) {
  if (!place) return "X"; const f = fold(place).trim();
  if (PLACE[f]) return PLACE[f];
  const letters = f.replace(/[^a-z]/g, ""); const cons = letters[0] + letters.slice(1).replace(/[aeiou]/g, "");
  return (cons.length >= 3 ? cons : letters).slice(0, 4).toUpperCase() || "X";
}

/** e.g. 1977_10_11_Bhubaneswar_Bhagavatam_10_66 (without .mp3). */
export function fileTitle(a: { date?: string | null; place?: string | null; scripture?: string | null; canto?: number | null; chapter?: number | null; verse?: string | null; title?: string | null; type?: string | null }) {
  const parts: string[] = [];
  if (a.date) parts.push(...String(a.date).slice(0, 10).split("-"));
  if (a.place) parts.push(word(a.place));
  if (a.scripture && a.scripture !== "OTHER") {
    parts.push(BOOK[a.scripture] || word(a.scripture));
    if (a.scripture === "CC" && a.canto) parts.push(LILA[a.canto - 1] || String(a.canto)); else if (a.canto) parts.push(String(a.canto));
    for (const x of [a.chapter, a.verse]) if (x !== null && x !== undefined && String(x).trim()) parts.push(String(x).trim().replace(/[^0-9a-z-]+/gi, "-"));
  } else if (a.title) parts.push(word(a.title).split("-").slice(0, 6).join("_"));
  return parts.filter(Boolean).join("_").slice(0, 150) || "Recording";
}

