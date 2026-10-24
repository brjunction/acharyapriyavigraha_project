// Every language the archive can grow into. Only "live" and "building" languages have a site today;
// "planned" ones show a placeholder portal and can be switched on from the dashboard (Languages module).
// The structure is built for 100+ languages: regions on the left, languages on the right, search across all.

export type LangStatus = "live" | "building" | "planned";
export type Lang = { code: string; native: string; name: string; region: string; status: LangStatus; ui: number; quotes: number; transcripts: number; rtl?: boolean };

export const REGIONS = [
  { key: "primary", title: "Primary languages", blurb: "Where the archive is complete first." },
  { key: "india", title: "Indian languages", blurb: "Languages of India, Nepal and Sri Lanka." },
  { key: "seasia", title: "East & Southeast Asia", blurb: "From Bali and Indonesia to Japan and China." },
  { key: "weurope", title: "Western Europe", blurb: "Radhadesh, Amsterdam, Paris and beyond." },
  { key: "eeurope", title: "Eastern Europe & Russia", blurb: "Slavic, Baltic and Balkan languages." },
  { key: "mideast", title: "Middle East & Caucasus", blurb: "Including right-to-left languages." },
  { key: "africa", title: "Africa", blurb: "Languages of the African continent." },
  { key: "americas", title: "Americas", blurb: "Regional varieties of Portuguese and Spanish." },
  { key: "other", title: "Classical & other", blurb: "Sanskrit and constructed languages." },
] as const;

const L = (code: string, native: string, name: string, region: string, status: LangStatus = "planned", ui = 0, quotes = 0, transcripts = 0, rtl = false): Lang => ({ code, native, name, region, status, ui, quotes, transcripts, rtl });

export const ALL_LANGUAGES: Lang[] = [
  L("en", "English", "English", "primary", "live", 100, 1840, 130),
  L("hi", "हिन्दी", "Hindi", "primary", "live", 92, 312, 18),
  L("or", "ଓଡ଼ିଆ", "Odia", "primary", "live", 85, 204, 11),

  L("bn", "বাংলা", "Bengali", "india", "building", 20, 12, 0),
  L("te", "తెలుగు", "Telugu", "india"), L("ta", "தமிழ்", "Tamil", "india"), L("ml", "മലയാളം", "Malayalam", "india"), L("kn", "ಕನ್ನಡ", "Kannada", "india"),
  L("gu", "ગુજરાતી", "Gujarati", "india"), L("mr", "मराठी", "Marathi", "india"), L("pa", "ਪੰਜਾਬੀ", "Punjabi", "india"), L("as", "অসমীয়া", "Assamese", "india"),
  L("mai", "मैथिली", "Maithili", "india"), L("ne", "नेपाली", "Nepali", "india"), L("ur", "اردو", "Urdu", "india", "planned", 0, 0, 0, true), L("si", "සිංහල", "Sinhala", "india"),

  L("id", "Bahasa Indonesia", "Indonesian", "seasia", "live", 64, 140, 6),
  L("ban", "Basa Bali", "Balinese", "seasia"), L("jv", "Basa Jawa", "Javanese", "seasia"),
  L("zh", "中文 (简体)", "Chinese, Simplified", "seasia"), L("zh-tw", "中文 (繁體)", "Chinese, Traditional", "seasia"),
  L("ja", "日本語", "Japanese", "seasia"), L("ko", "한국어", "Korean", "seasia"), L("th", "ไทย", "Thai", "seasia"), L("vi", "Tiếng Việt", "Vietnamese", "seasia"),
  L("ms", "Bahasa Melayu", "Malay", "seasia"), L("fil", "Filipino", "Filipino", "seasia"), L("my", "မြန်မာ", "Burmese", "seasia"), L("km", "ខ្មែរ", "Khmer", "seasia"),

  L("nl", "Nederlands", "Dutch", "weurope", "live", 70, 96, 4),
  L("es", "Español", "Spanish", "weurope", "building", 10, 0, 0),
  L("fr", "Français", "French", "weurope"), L("de", "Deutsch", "German", "weurope"), L("pt", "Português", "Portuguese", "weurope"), L("it", "Italiano", "Italian", "weurope"),
  L("ca", "Català", "Catalan", "weurope"), L("sv", "Svenska", "Swedish", "weurope"), L("no", "Norsk", "Norwegian", "weurope"), L("da", "Dansk", "Danish", "weurope"),
  L("fi", "Suomi", "Finnish", "weurope"), L("el", "Ελληνικά", "Greek", "weurope"),

  L("ru", "Русский", "Russian", "eeurope", "live", 58, 120, 5),
  L("uk", "Українська", "Ukrainian", "eeurope"), L("be", "Беларуская", "Belarusian", "eeurope"), L("pl", "Polski", "Polish", "eeurope"), L("cs", "Čeština", "Czech", "eeurope"),
  L("sk", "Slovenčina", "Slovak", "eeurope"), L("bg", "Български", "Bulgarian", "eeurope"), L("sr", "Српски", "Serbian", "eeurope"), L("hr", "Hrvatski", "Croatian", "eeurope"),
  L("sl", "Slovenščina", "Slovenian", "eeurope"), L("ro", "Română", "Romanian", "eeurope"), L("hu", "Magyar", "Hungarian", "eeurope"),
  L("lt", "Lietuvių", "Lithuanian", "eeurope"), L("lv", "Latviešu", "Latvian", "eeurope"), L("et", "Eesti", "Estonian", "eeurope"),

  L("ar", "العربية", "Arabic", "mideast", "planned", 0, 0, 0, true), L("fa", "فارسی", "Persian", "mideast", "planned", 0, 0, 0, true), L("he", "עברית", "Hebrew", "mideast", "planned", 0, 0, 0, true),
  L("tr", "Türkçe", "Turkish", "mideast"), L("ka", "ქართული", "Georgian", "mideast"), L("hy", "Հայերեն", "Armenian", "mideast"),

  L("sw", "Kiswahili", "Swahili", "africa"), L("af", "Afrikaans", "Afrikaans", "africa"), L("am", "አማርኛ", "Amharic", "africa"), L("yo", "Yorùbá", "Yoruba", "africa"), L("zu", "isiZulu", "Zulu", "africa"),

  L("pt-br", "Português (Brasil)", "Portuguese, Brazil", "americas"), L("es-419", "Español (Latinoamérica)", "Spanish, Latin America", "americas"),

  L("sa", "संस्कृतम्", "Sanskrit", "other"), L("eo", "Esperanto", "Esperanto", "other"),
];

/** Languages that already have a site (live or being built). */
export const LANGUAGES = ALL_LANGUAGES.filter((l) => l.status !== "planned");
export const STATUS_LABEL: Record<LangStatus, string> = { live: "Live", building: "In progress", planned: "Planned" };
