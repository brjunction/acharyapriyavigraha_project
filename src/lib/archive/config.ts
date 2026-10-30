/**
 * The Śrīla Gurudeva archive: one store, many collections. Each collection has its own sections
 * (editable in the Studio), its own fields, and its own designed page on the website.
 */
export type FieldKey = "subtitle" | "person" | "person_role" | "recipient" | "date" | "year" | "date_label" | "place" | "region" | "country" | "cover" | "images" | "summary" | "body" | "chapters" | "links" | "media" | "tags" | "related" | "status_label";
export type Layout = "quotes" | "letters" | "albums" | "places" | "objects" | "people" | "projects" | "chain" | "links";
export type Collection = {
  key: string; label: string; singular: string; base: string; layout: Layout; intro: string; icon: string;
  sections: [string, string, string][]; fields: FieldKey[]; labels?: Partial<Record<FieldKey, [string, string?]>>;
  sort: "date" | "position" | "title"; related?: string;
};

export const COLLECTIONS: Record<string, Collection> = {
  memories: {
    key: "memories", label: "Memories & pastimes", singular: "memory", base: "/gurudeva/memories", layout: "quotes", icon: "HandHeart", sort: "date",
    intro: "Those who knew him remember Śrīla Gurudeva: his words, his moods, and the pastimes they witnessed.",
    sections: [["gbc", "GBC members & ISKCON leaders", "Leaders of ISKCON who served with him"], ["prabhupada-disciples", "Disciples of Śrīla Prabhupāda", "His godbrothers and godsisters"], ["disciples", "His disciples", "Those he initiated"], ["grand-disciples", "Grand-disciples", "Disciples of his disciples"], ["vaishnavas", "Other Vaiṣṇavas & sādhus", "From other sampradāyas and maṭhas"], ["family", "Family & early life", "Those who knew him before sannyāsa"]],
    fields: ["person", "person_role", "cover", "year", "date_label", "place", "summary", "body", "media", "images", "tags"],
    labels: { person: ["Who is remembering", "e.g. Śrīla Prabhupāda’s disciple, His Grace …"], person_role: ["Their service or relation", "e.g. GBC, temple president, disciple since 1986"], cover: ["Photo of the speaker"], summary: ["A line to show on the card", "The heart of the memory, in their words"], media: ["Audio or video of this memory", "YouTube or MP3 link"], year: ["Year it happened"] },
  },
  glorifications: {
    key: "glorifications", label: "Glorifications", singular: "offering", base: "/gurudeva/glorifications", layout: "quotes", icon: "Gift", sort: "date",
    intro: "Vyāsa-pūjā offerings, poems and glorifications of Śrīla Gurudeva by his disciples, grand-disciples and other Vaiṣṇavas.",
    sections: [["disciples", "By his disciples", "Vyāsa-pūjā offerings"], ["grand-disciples", "By grand-disciples", ""], ["vaishnavas", "By godbrothers & Vaiṣṇavas", ""], ["poems", "Poems & songs", ""]],
    fields: ["person", "person_role", "year", "date_label", "place", "cover", "summary", "body", "media", "tags"],
    labels: { person: ["Written by"], year: ["Vyāsa-pūjā year"], summary: ["A line to show on the card"] },
  },
  letters: {
    key: "letters", label: "Letters", singular: "letter", base: "/gurudeva/letters", layout: "letters", icon: "Mail", sort: "date",
    intro: "Letters between Śrīla Gurudeva and Śrīla Prabhupāda, his letters to disciples, and letters from other Vaiṣṇavas.",
    sections: [["from-prabhupada", "From Śrīla Prabhupāda", "Letters Śrīla Prabhupāda wrote to him"], ["to-prabhupada", "To Śrīla Prabhupāda", "His letters to his spiritual master"], ["offerings-to-prabhupada", "His offerings to Śrīla Prabhupāda", "Vyāsa-pūjā offerings he wrote for his spiritual master"], ["to-disciples", "To his disciples", ""], ["from-vaishnavas", "From other Vaiṣṇavas", ""], ["others", "Other letters", ""]],
    fields: ["person", "recipient", "date", "date_label", "place", "images", "summary", "body", "tags"],
    labels: { person: ["From"], recipient: ["To"], images: ["Scans of the letter", "Each page as a picture"], summary: ["Opening line or summary"] },
  },
  gallery: {
    key: "gallery", label: "Gallery", singular: "album", base: "/gurudeva/gallery", layout: "albums", icon: "Image", sort: "date",
    intro: "Photographs of Śrīla Gurudeva, gathered in albums by occasion, place and year.",
    sections: [["portraits", "Portraits", ""], ["deities", "Deities", "Śrī Śrī Rādhā-Gopāl Jiu, Kṛṣṇa-Balarāma and others"], ["festivals", "Festivals", "Vyāsa-pūjā, Ratha-yātrā, Kārttika and more"], ["initiations", "Initiations & sannyāsa", ""], ["travels", "Travels & preaching", "Tours in India and abroad"], ["temples", "Temples & projects", ""], ["everyday", "Everyday moments", ""]],
    fields: ["date", "year", "date_label", "place", "country", "cover", "images", "summary", "body", "tags"],
    labels: { images: ["Photos in this album", "Add many at once; give each a caption"], cover: ["Album cover", "If empty, the first photo is used"] },
  },
  places: {
    key: "places", label: "Places of remembrance", singular: "place", base: "/gurudeva/places-of-remembrance", layout: "places", icon: "MapPin", sort: "position",
    intro: "The places where Śrīla Gurudeva was born, lived, worshipped, preached and left this world.",
    sections: [["odisha", "Odisha", "Where he was born and served"], ["india", "Elsewhere in India", "Holy dhāmas and cities he visited"], ["abroad", "Outside India", "Countries where he preached"]],
    fields: ["subtitle", "region", "country", "date_label", "cover", "images", "summary", "body", "links", "tags"],
    labels: { subtitle: ["What happened here", "e.g. His birthplace"], region: ["City / state"], date_label: ["When he was there", "e.g. 1985, 1991–93"], links: ["Map and other links", "Label | link, e.g. Map | https://maps.google.com/…"] },
  },
  belongings: {
    key: "belongings", label: "Personal belongings", singular: "item", base: "/gurudeva/personal-belongings", layout: "objects", icon: "Package", sort: "position",
    intro: "Things Śrīla Gurudeva used every day, and the stories that go with them.",
    sections: [["worship", "For worship", "Beads, Deities, articles of pūjā"], ["clothing", "Clothing", ""], ["writing", "Books & writing", "His books, pens, notebooks"], ["daily", "Daily use", ""]],
    fields: ["subtitle", "place", "date_label", "cover", "images", "summary", "body", "tags"],
    labels: { subtitle: ["What it is"], place: ["Where it is kept now"], date_label: ["From when", "e.g. 1980s"], summary: ["How he used it", "One or two lines"], body: ["Its story"] },
  },
  disciples: {
    key: "disciples", label: "His disciples", singular: "disciple", base: "/gurudeva/disciples", layout: "people", icon: "IdCard", sort: "title",
    intro: "Those whom Śrīla Gurudeva accepted as his disciples, with their stories and their memories of him.",
    sections: [["india", "In India", ""], ["abroad", "Outside India", ""]],
    fields: ["subtitle", "date", "date_label", "place", "country", "cover", "summary", "body", "images", "links", "related"],
    labels: { subtitle: ["Name before initiation (optional)"], date: ["Initiation date"], date_label: ["Or initiation year as written"], place: ["Place of initiation"], country: ["Country they serve in"], cover: ["Photo"], summary: ["Their service, in one line"], body: ["Biography"], related: ["Their memories of Śrīla Gurudeva", "Choose from Memories & pastimes"] },
    related: "memories",
  },
  projects: {
    key: "projects", label: "Projects", singular: "project", base: "/gurudeva/projects", layout: "projects", icon: "Landmark", sort: "position",
    intro: "ISKCON Bhubaneswar, the temples and initiatives he began, and the work that continues in his relation.",
    sections: [["bhubaneswar", "ISKCON Bhubaneswar", "From a mud hut to Śrī Śrī Kṛṣṇa-Balarāma"], ["temples", "Temples & initiatives", "Temples and āśramas he established"], ["relation", "Projects in his relation", "Anniversaries, libraries and other work connected with him"], ["taptajivanam", "Taptajīvanam projects", "Translations, publications, websites, apps and the WebFolio"]],
    fields: ["cover", "summary", "chapters", "links"],
    labels: { cover: ["Picture"], summary: ["About it", "A few lines"], chapters: ["Drop-down sections (optional)", "e.g. How it started — only if needed"], links: ["Website and YouTube", "Label | link, e.g. Website | https://…"] },
  },
  parampara: {
    key: "parampara", label: "Guru-paramparā", singular: "ācārya", base: "/gurudeva/guru-parampara", layout: "chain", icon: "GitBranch", sort: "position",
    intro: "The disciplic succession from Lord Kṛṣṇa, through Śrī Caitanya Mahāprabhu and the Gosvāmīs, to Śrīla Prabhupāda and Śrīla Gurudeva.",
    sections: [["origin", "From Lord Kṛṣṇa", ""], ["mahaprabhu", "Śrī Caitanya Mahāprabhu & the Gosvāmīs", ""], ["acaryas", "The ācāryas", ""], ["modern", "Śrīla Prabhupāda and Śrīla Gurudeva", ""]],
    fields: ["subtitle", "date_label", "place", "cover", "summary", "body", "links"],
    labels: { subtitle: ["Known as", "e.g. Founder of the Gauḍīya Vaiṣṇava sampradāya"], date_label: ["Period", "Optional"], summary: ["A few lines about him"] },
  },
  prabhupada: {
    key: "prabhupada", label: "Śrīla Prabhupāda resources", singular: "resource", base: "/gurudeva/srila-prabhupada", layout: "links", icon: "Crown", sort: "position",
    intro: "Books, biography, audio and websites of Śrīla Prabhupāda.",
    sections: [["books", "His books", "Read online"], ["biography", "His life", "Biographies and memories"], ["audio", "Lectures & audio", ""], ["sites", "Websites & archives", ""]],
    fields: ["subtitle", "cover", "summary", "links"],
    labels: { subtitle: ["Short description"], links: ["Link", "Label | https://…"] },
  },
};
export const ARCHIVE_ORDER = ["memories", "glorifications", "gallery", "places", "belongings", "letters", "disciples", "projects", "parampara", "prabhupada"];
export const coll = (k: string) => COLLECTIONS[k];
export const has = (c: Collection, f: FieldKey) => c.fields.includes(f);
export const labelOf = (c: Collection, f: FieldKey, fallback: string) => c.labels?.[f]?.[0] || fallback;
export const hintOf = (c: Collection, f: FieldKey) => c.labels?.[f]?.[1];

export type Img = { url: string; caption?: string; date?: string };
export type Chapter = { title: string; text: string };
export type LinkT = { label: string; url: string };
export type Item = {
  id: string; collection: string; section: string | null; slug: string; title: string; subtitle: string | null; person: string | null; person_role: string | null; recipient: string | null;
  date: string | null; year: number | null; date_label: string | null; place: string | null; region: string | null; country: string | null; cover: string | null; images: Img[];
  summary: string | null; body: any[]; chapters: Chapter[]; links: LinkT[]; media: string | null; tags: string[]; related: string[]; status_label: string | null;
  featured: boolean; position: number; status: string;
};
export type Section = { key: string; title: string; description: string | null; position: number };

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** “2 March 1977”, “1986”, or the editor’s own words. */
export function whenOf(i: Pick<Item, "date" | "year" | "date_label">, short = false) {
  if (i.date_label) return i.date_label;
  if (i.date) { const [y, m, d] = String(i.date).slice(0, 10).split("-").map(Number); return short ? `${d} ${MON[m - 1].slice(0, 3)} ${y}` : `${d} ${MON[m - 1]} ${y}`; }
  return i.year ? String(i.year) : "";
}
export const coverOf = (i: Pick<Item, "cover" | "images">) => i.cover || i.images?.[0]?.url || null;
export const hrefOf = (c: Collection, i: Pick<Item, "slug">) => `${c.base}/${i.slug}`;
/** YouTube link → embed address, or null. */
export function youtube(u?: string | null) { const m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(u || ""); return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null; }
