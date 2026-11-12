/* Script & font converter (from the Harināmāmṛta-vyākaraṇam project): Balaram font, IAST, Devanāgarī, Bengali, Odia,
   Harvard-Kyoto, ITRANS and SLP1 — any to any. Sanskrit is converted as Sanskrit (IAST words joined by sandhi in Indic scripts,
   final virāma kept); ordinary text (Bengali, Hindi or Odia as languages, or English) letter by letter. */
export type ScriptName = "iast" | "devanagari" | "bengali" | "oriya";
export type Scheme = ScriptName | "balarama" | "hk" | "itrans" | "slp1";
export const SCHEMES: { value: Scheme; label: string; sub: string }[] = [
  { value: "iast", label: "IAST", sub: "kṛṣṇa" },
  { value: "balarama", label: "Balaram font", sub: "kåñëa — text from old Balaram-font books" },
  { value: "devanagari", label: "देवनागरी", sub: "Devanāgarī · कृष्ण" },
  { value: "bengali", label: "বাংলা", sub: "Bengali · কৃষ্ণ" },
  { value: "oriya", label: "ଓଡ଼ିଆ", sub: "Odia · କୃଷ୍ଣ" },
  { value: "hk", label: "Harvard-Kyoto", sub: "kRSNa" },
  { value: "itrans", label: "ITRANS", sub: "kRRiShNa" },
  { value: "slp1", label: "SLP1", sub: "kfzRa" },
];
const INDIC: Scheme[] = ["devanagari", "bengali", "oriya"];

// ------------------------------------------------------------ Balaram
const PAIRS: [string, string][] = [["ﬁ", "fi"], ["ﬂ", "fl"], ["ä", "ā"], ["é", "ī"], ["ü", "ū"], ["å", "ṛ"], ["è", "ṝ"], ["ì", "ṅ"], ["ñ", "ṣ"], ["ï", "ñ"], ["ö", "ṭ"], ["ò", "ḍ"], ["ë", "ṇ"], ["ç", "ś"], ["à", "ṁ"], ["ù", "ḥ"], ["ÿ", "ḷ"], ["û", "ḹ"],
  ["Ä", "Ā"], ["É", "Ī"], ["Ü", "Ū"], ["Å", "Ṛ"], ["È", "Ṝ"], ["Ì", "Ṅ"], ["Ñ", "Ṣ"], ["Ï", "Ñ"], ["Ö", "Ṭ"], ["Ò", "Ḍ"], ["Ë", "Ṇ"], ["Ç", "Ś"], ["À", "Ṁ"], ["Ù", "Ḥ"], ["ß", "Ḷ"], [" ", " "]];
const BMAP = new Map(PAIRS); const BRE = new RegExp(`[${PAIRS.map(([a]) => a).join("")}]`, "g");
export const balaramaToIast = (s: string) => s.replace(BRE, (c) => BMAP.get(c) ?? c).normalize("NFC");
const TO_B: [string, string][] = [["ā", "ä"], ["ī", "é"], ["ū", "ü"], ["ṛ", "å"], ["ṝ", "è"], ["ṅ", "ì"], ["ṣ", "ñ"], ["ñ", "ï"], ["ṭ", "ö"], ["ḍ", "ò"], ["ṇ", "ë"], ["ś", "ç"], ["ṁ", "à"], ["ṃ", "à"], ["ḥ", "ù"], ["ḷ", "ÿ"], ["ḹ", "û"],
  ["Ā", "Ä"], ["Ī", "É"], ["Ū", "Ü"], ["Ṛ", "Å"], ["Ṝ", "È"], ["Ṅ", "Ì"], ["Ṣ", "Ñ"], ["Ñ", "Ï"], ["Ṭ", "Ö"], ["Ḍ", "Ò"], ["Ṇ", "Ë"], ["Ś", "Ç"], ["Ṁ", "À"], ["Ṃ", "À"], ["Ḥ", "Ù"], ["Ḷ", "ß"]];
const TB = new Map(TO_B); const TBRE = new RegExp(`[${TO_B.map(([a]) => a).join("")}]`, "g");
export const iastToBalarama = (s: string) => s.normalize("NFC").replace(TBRE, (c) => TB.get(c) ?? c);   // one pass, so ñ→ï and ṣ→ñ never collide

// ------------------------------------------------------------ detection
const IAST_MARKS = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥĀĪŪṚṜḶṄṆŚṢṬḌṀṂḤ]/; const BAL_MARKS = /[äéüåèìöòëçàùÿû]/; const IAST_ONLY = /[āīūṛṝḷḹṅṭḍṇśṣṁṃḥĀĪŪṚṜḶṄṆŚṢṬḌṀṂḤ]/;
export function detectScript(text: string): ScriptName | null { if (/[ঀ-৿]/.test(text)) return "bengali"; if (/[଀-୿]/.test(text)) return "oriya"; if (/[ऀ-ॿ]/.test(text)) return "devanagari"; return null; }
export function detectScheme(text: string): Scheme {
  const s = text.normalize("NFC"); const indic = detectScript(s); if (indic) return indic;
  if (BAL_MARKS.test(s) && !IAST_ONLY.test(s)) return "balarama"; if (IAST_MARKS.test(s)) return "iast";
  if (/[a-z][RSNTDMH](?:[a-z]|\b)/.test(s) && /\b[a-z]+[A-Z][a-z]*\b/.test(s)) return /RRi|Sh|\.N|aa|ii|uu/.test(s) ? "itrans" : /[fzwqx]/.test(s) && /[A-Z]/.test(s) ? "slp1" : "hk";
  return "iast";
}
export type Check = { sanskrit: boolean; sure: boolean; reasons: string[] };
const words = (s: string) => s.toLowerCase().split(/[^\p{L}\p{M}'’]+/u).filter(Boolean); const count = (ws: string[], set: Set<string>) => ws.filter((w) => set.has(w)).length;
const EN = new Set("the of and to in is was that it for as with his he on be by this are from at which not have had they or but you their were all one we an has her there been who when will would shall our them more these so said into my me what than its".split(" "));
const SA_ROMAN = new Set("ca tu hi eva iti na api vā yathā tathā tat sa saḥ te me mama aham tvam yaḥ yat ye tasya tasmāt iva atha kim ced yadi tadā punaḥ sarva sarvam".split(" "));
const HI = new Set("है हैं का की के में और से को नहीं भी यह वह था थे थी पर हो हुआ एक लिए कर करते गया ने".split(" "));
const SA_DEVA = new Set("च तु हि एव इति न अपि वा यथा तथा तत् सः ते मे मम अहम् त्वम् यः यत् तस्य तस्मात् इव अथ किम् यदि तदा पुनः".split(" "));
const BN = new Set("এবং আমি তুমি আমার তোমার করে হয় হইল হয়ে কি কী এই সেই আর ছিল থেকে জন্য না যে তার তাঁর সে করিয়া দিয়া হৈল".split(" "));
const SA_BENG = new Set("চ তু হি এব ইতি ন অপি বা যথা তথা তৎ তত্ সঃ তে মে মম অহম্ ত্বম্ যঃ যৎ তস্য তস্মাৎ ইব অথ কিম্ যদি".split(" "));
const OR = new Set("ଏବଂ ଓ ଅଛି ଅଟେ କରି ହୋଇ ପାଇଁ ଯେ ମୁଁ ତୁମେ ଏହି ସେହି ଥିଲା ନାହିଁ ଆଉ".split(" "));
const SA_ORYA = new Set("ଚ ତୁ ହି ଏବ ଇତି ନ ଅପି ବା ଯଥା ତଥା ସଃ ତେ ମେ ମମ ଅହମ୍ ତ୍ୱମ୍ ଯଃ ତସ୍ୟ ଇବ ଅଥ ଯଦି".split(" "));
/** Does a text look like Sanskrit, or like ordinary text? A guess with its reasons. */
export function checkText(text: string, scheme: Scheme = detectScheme(text)): Check {
  let s = text.normalize("NFC"); if (scheme === "balarama") s = balaramaToIast(s); const ws = words(s); if (!ws.length) return { sanskrit: true, sure: false, reasons: [] };
  const reasons: string[] = []; let sa = 0, other = 0;
  if (INDIC.includes(scheme)) {
    const [lang, saw, name] = scheme === "devanagari" ? [HI, SA_DEVA, "Hindi"] : scheme === "bengali" ? [BN, SA_BENG, "Bengali"] : [OR, SA_ORYA, "Odia"];
    const l = count(ws, lang as Set<string>), k = count(ws, saw as Set<string>), vis = (s.match(/[ःঃଃ]/g) ?? []).length, fv = ws.filter((w) => /[्্୍]$/.test(w)).length;
    if (l) reasons.push(`${l} common ${name} word${l > 1 ? "s" : ""}`); if (k) reasons.push(`${k} Sanskrit particle${k > 1 ? "s" : ""}`); if (vis) reasons.push(`${vis} visarga${vis > 1 ? "s" : ""}`); if (fv) reasons.push(`${fv} word${fv > 1 ? "s" : ""} ending in a virāma`);
    sa = k * 2 + vis * 1.5 + fv * 1.5; other = l * 2.5;
  } else {
    const en = count(ws, EN), k = count(ws, SA_ROMAN), marked = ws.filter((w) => IAST_MARKS.test(w)).length, end = ws.filter((w) => /(?:ḥ|ṁ|ṃ|asya|ena|āya|ānām|ebhyaḥ|āni|ayā|ām)$/.test(w)).length;
    if (en) reasons.push(`${en} English word${en > 1 ? "s" : ""}`); if (k) reasons.push(`${k} Sanskrit particle${k > 1 ? "s" : ""}`); if (end) reasons.push(`${end} Sanskrit ending${end > 1 ? "s" : ""}`);
    sa = k * 2 + end * 1.5 + (marked / ws.length) * 4; other = en * 2.5;
  }
  const sanskrit = sa >= other; const sure = Math.abs(sa - other) >= 3 || (sa > 0 && other === 0) || (other > 0 && sa === 0); if (!reasons.length) reasons.push("no clear signs either way");
  return { sanskrit, sure, reasons };
}

// ------------------------------------------------------------ convert
const lib = async () => (await import("@indic-transliteration/sanscript")).default as any;
/** IAST as printed in books separates words and marks compounds with hyphens; Indic scripts write the same verse joined. */
export const joinIastSandhi = (t: string) => t.normalize("NFC").replace(/[’‘ʼ]/g, "'").replace(/(\p{L}\p{M}*)-(?=\p{L})/gu, "$1").replace(/\s+'/g, "'").replace(/([kgcjṭḍtdpbmyrlvśṣsnñṅṇh])\s+(?=[\p{L}'])/gu, "$1");
const bengaliOrthography = (s: string) => s.replace(/ত্(?![তথনমযরব])/g, "ৎ").replace(/(?<=[ঀ-৿])(?<!্)য(?!়)/g, "য়");
export async function convertScript(text: string, from: ScriptName, to: ScriptName, opts: { sanskrit?: boolean; join?: boolean } = {}) {
  if (!text || from === to) return text; const sanskrit = opts.sanskrit !== false; const join = sanskrit && opts.join !== false; const S = await lib();
  const src = from === "iast" ? (join ? joinIastSandhi(text) : text.normalize("NFC").replace(/[’‘ʼ]/g, "'").replace(/(\p{L}\p{M}*)-(?=\p{L})/gu, "$1")).replace(/ṁ/g, "ṃ")
    : from === "bengali" ? text.normalize("NFC").replace(/য়/g, "য").replace(/ৎ/g, "ত্") : from === "oriya" ? text.replace(/ୟ/g, "ଯ") : text;
  const out: string = S.t(src, from, to);
  if (to === "iast") return out.replace(/\|\|/g, "॥").replace(/\|/g, "।");
  const dropFinal = (t: string, v: string) => (sanskrit ? t : t.replace(new RegExp(`${v}(?=[\\s,.;:!?।॥|]|$)`, "gu"), ""));
  if (to === "bengali") return dropFinal(bengaliOrthography(out), "্");
  if (to === "oriya") return dropFinal(out.replace(/(?<=[଀-୿])(?<!୍)ଯ(?!଼)/g, "ୟ"), "୍");
  return dropFinal(out, "्");
}
async function toIast(text: string, from: Scheme) {
  if (from === "iast") return text.normalize("NFC"); if (from === "balarama") return balaramaToIast(text.normalize("NFC"));
  if (from === "hk" || from === "itrans" || from === "slp1") return ((await lib()).t(text, from, "iast") as string).replace(/ṃ/g, "ṁ");
  return convertScript(text, from, "iast");
}
export async function convertText(text: string, from: Scheme, to: Scheme, sanskrit: boolean): Promise<string> {
  if (!text.trim() || from === to) return text;
  if (INDIC.includes(from) && (INDIC.includes(to) || to === "iast")) {
    const r = await convertScript(text, from as ScriptName, to as ScriptName, { sanskrit });
    if (from === "bengali" && !sanskrit) return to === "iast" ? r.replace(/v/g, "b").replace(/V/g, "B") : to === "devanagari" ? r.replace(/व/g, "ब") : to === "oriya" ? r.replace(/ଵ/g, "ବ") : r;   // Bengali as a language has no va
    return r;
  }
  const iast = await toIast(text, from); if (to === "iast") return iast; if (to === "balarama") return iastToBalarama(iast);
  if (to === "hk" || to === "itrans" || to === "slp1") return (await lib()).t(iast.replace(/ṁ/g, "ṃ"), "iast", to);
  return convertScript(iast, "iast", to as ScriptName, { sanskrit, join: sanskrit });
}
