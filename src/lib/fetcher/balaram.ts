/* Old "Balaram" letters → proper diacritics (IAST).
   Books typeset with the Balaram family of fonts (Balaram, Gaudiya, ScaGoudy, ScaOptima, Rama-Palatino, Radha-Palatino,
   Tamal, Sca…) store "Kṛṣṇa" as "Kåñëa". All of them share one map. */
const MAP: Record<string, string> = {
  "ä": "ā", "é": "ī", "ü": "ū", "å": "ṛ", "è": "ṝ", "ÿ": "ḷ", "ì": "ṅ", "ï": "ñ", "ö": "ṭ", "ò": "ḍ", "ë": "ṇ", "ç": "ś", "ñ": "ṣ", "à": "ṁ", "ù": "ḥ",
  "Ä": "Ā", "É": "Ī", "Ü": "Ū", "Å": "Ṛ", "È": "Ṝ", "Ì": "Ṅ", "Ï": "Ñ", "Ö": "Ṭ", "Ò": "Ḍ", "Ë": "Ṇ", "Ç": "Ś", "Ñ": "Ṣ", "À": "Ṁ", "Ù": "Ḥ", "ß": "Ḷ",
  "‚": ",", "´": "’", "˙": "ḷ", "¯": "",
};
const RE = new RegExp(`[${Object.keys(MAP).join("")}]`, "g");
export const balaramToIast = (s: string) => s.replace(RE, (c) => MAP[c] ?? c);
/** Does this font carry Balaram letters? (by its name) */
export const isBalaramFont = (name: string) => /balaram|gaudiya|^sca[A-Z]|sca(goudy|optima|times|helvet|korin|sabon|palat|benguiat|cheltenham|frutiger|bookman)|rama-?|radha-?palat|tamal|^Sca|dravida|nitai|avanti/i.test(name.replace(/^[A-Z]{6}\+/, ""));
/** Does this text look like Balaram letters? (when the font's name does not tell) — typical letter pairs that never occur in real French/German/Spanish words of such books. */
export function looksBalaram(text: string) {
  const hits = (text.match(/[kK]åñë|[çÇ]r[ié]|[vV]iñëu|[bB]hägavat|[pP]rabhupäd|[cC]aitany|[gG]auò|[äéü][a-z]*[ñëçåàùìò]|[ñëçåàùìò][a-z]*[äéü]/g) || []).length;
  const iast = (text.match(/[āīūṛṣṇśṁḥṭḍ]/g) || []).length;
  return hits >= 3 && hits > iast;
}
/** Unicode tidy-up common to every source: composed letters, soft hyphens, odd spaces. */
export const tidyText = (s: string) => s.normalize("NFC").replace(/­/g, "").replace(/[  -  ]/g, " ").replace(/​|﻿/g, "").replace(/ﬁ/g, "fi").replace(/ﬂ/g, "fl").replace(/ﬀ/g, "ff").replace(/ﬃ/g, "ffi").replace(/ﬄ/g, "ffl");
