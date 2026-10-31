/** Languages books can be in. Code, English name, name in its own script. */
export const BOOK_LANGS: [string, string, string][] = [
  ["en", "English", "English"], ["hi", "Hindi", "हिन्दी"], ["or", "Odia", "ଓଡ଼ିଆ"], ["bn", "Bengali", "বাংলা"], ["ne", "Nepali", "नेपाली"],
  ["te", "Telugu", "తెలుగు"], ["ta", "Tamil", "தமிழ்"], ["mr", "Marathi", "मराठी"], ["gu", "Gujarati", "ગુજરાતી"], ["sa", "Sanskrit", "संस्कृतम्"],
  ["ru", "Russian", "Русский"], ["uk", "Ukrainian", "Українська"], ["de", "German", "Deutsch"], ["fr", "French", "Français"], ["es", "Spanish", "Español"],
  ["pt", "Portuguese", "Português"], ["it", "Italian", "Italiano"], ["nl", "Dutch", "Nederlands"], ["pl", "Polish", "Polski"], ["cs", "Czech", "Čeština"],
  ["id", "Indonesian", "Bahasa Indonesia"], ["zh", "Chinese", "中文"], ["ja", "Japanese", "日本語"],
];
export const langName = (c?: string | null) => BOOK_LANGS.find((l) => l[0] === c)?.[1] || c || "";
export const langNative = (c?: string | null) => BOOK_LANGS.find((l) => l[0] === c)?.[2] || c || "";
