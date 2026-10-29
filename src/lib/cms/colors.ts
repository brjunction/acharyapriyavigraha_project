export const COLORS: Record<string, { text: string; bg: string }> = {
  default: { text: "inherit", bg: "transparent" },
  gray: { text: "#7a6e64", bg: "#f1ece6" }, brown: { text: "#7a4a24", bg: "#f4e7da" }, red: { text: "#b0281e", bg: "#fbe4e1" },
  orange: { text: "#c25d06", bg: "#fdebd6" }, yellow: { text: "#a37200", bg: "#fbf1cc" }, green: { text: "#2f6b3f", bg: "#e3f1e5" },
  blue: { text: "#2a4f9a", bg: "#e2eaf8" }, purple: { text: "#6c3f9e", bg: "#efe6f7" }, pink: { text: "#a3365a", bg: "#f9e3ea" },
};
export const OPTION_COLORS = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];
export type Opt = { name: string; color: string };
export const opts = (o: any[] | undefined): Opt[] => (o || []).map((x, i) => (typeof x === "string" ? { name: x, color: OPTION_COLORS[i % OPTION_COLORS.length] } : x));
