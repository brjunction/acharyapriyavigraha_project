/* The designs and colours a Videos section can have (shared by the Studio and the site). */
export const LAYOUTS = [
  ["featured", "Featured — one big video, a list beside it"],
  ["spotlight", "Spotlight — a wide banner video, a row below"],
  ["row", "Row — a row that swipes sideways"],
  ["grid", "Grid — neat tiles"],
  ["shorts", "Shorts — tall cards that play one after another"],
  ["playlists", "Playlists — one card for each playlist"],
  ["carousel", "Carousel — big slides that change by themselves"],
  ["list", "List — a neat numbered list"],
  ["channels", "Channels — channel cards with their pictures"],
] as const;
export type Layout = (typeof LAYOUTS)[number][0];
export const COLORS = ["saffron", "rose", "teal", "indigo", "leaf", "gold", "plum"] as const;
