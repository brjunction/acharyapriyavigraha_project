/** Lower-case text without diacritics, for searching “krsna” and finding “Kṛṣṇa”. */
export const fold = (s: unknown) => String(s ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’'`]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export const slugify = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "untitled";
export const SCRIPTURES: Record<string, string> = { BG: "Bhagavad-gītā", SB: "Śrīmad-Bhāgavatam", CC: "Caitanya-caritāmṛta", NOI: "Nectar of Instruction", ISO: "Śrī Īśopaniṣad", BS: "Brahma-saṁhitā", OTHER: "Other" };
export const CC_LILA = ["Ādi", "Madhya", "Antya"];
/** “SB 1.2.6”, “BG 18.66”, “CC Madhya 15.104” */
export function verseRef(a: { scripture?: string | null; canto?: number | null; chapter?: number | null; verse?: string | null }) {
  if (!a.scripture || a.scripture === "OTHER") return a.verse || "";
  if (a.scripture === "CC") return [`CC`, a.canto ? CC_LILA[a.canto - 1] : "", [a.chapter, a.verse].filter(Boolean).join(".")].filter(Boolean).join(" ");
  if (a.scripture === "SB") return `SB ${[a.canto, a.chapter, a.verse].filter((x) => x !== null && x !== undefined && x !== "").join(".")}`.trim();
  return `${a.scripture} ${[a.chapter, a.verse].filter((x) => x !== null && x !== undefined && x !== "").join(".")}`.trim();
}
/** Reads “SB 1.2.6”, “Bg 18.66”, “CC Madhya 15.104” back into parts. */
export function parseRef(s: string): { scripture?: string; canto?: number; chapter?: number; verse?: string } {
  const t = s.trim(); const m = /^(sb|bg|cc|noi|iso|bs)\.?\s*(adi|ādi|madhya|antya)?\s*([\d.\-]+)?/i.exec(fold(t).replace(/ā/g, "a"));
  if (!m) return t ? { scripture: "OTHER", verse: t } : {};
  const sc = m[1].toUpperCase(); const nums = (m[3] || "").split(".").filter(Boolean);
  if (sc === "CC") return { scripture: "CC", canto: m[2] ? ["adi", "madhya", "antya"].indexOf(m[2].replace("ā", "a")) + 1 : undefined, chapter: nums[0] ? Number(nums[0]) : undefined, verse: nums[1] };
  if (sc === "SB") return { scripture: "SB", canto: nums[0] ? Number(nums[0]) : undefined, chapter: nums[1] ? Number(nums[1]) : undefined, verse: nums[2] };
  return { scripture: sc, chapter: nums[0] ? Number(nums[0]) : undefined, verse: nums[1] };
}
export const durText = (sec?: number | null) => { if (!sec) return ""; const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`; };
export const parseDur = (v: string) => { const p = String(v).trim().split(":").map(Number); if (p.some(isNaN)) return null; return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : Math.round(p[0] * 60); };
export const AUDIO_KINDS: [string, string][] = [["lecture", "Lecture"], ["darshan", "Darśana"], ["seminar", "Seminar"], ["festival", "Festival talk"], ["qa", "Questions & answers"], ["initiation", "Initiation"], ["kirtan", "Kīrtana"], ["bhajan", "Bhajana"], ["other", "Other"]];
export const isSong = (k?: string) => k === "kirtan" || k === "bhajan";
