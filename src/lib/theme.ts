/* The website’s look, set in Studio → Design. Every value is optional; empty means the built-in design. */
export type Theme = {
  primary?: string; primaryDeep?: string; primarySoft?: string; page?: string; band?: string; surface?: string; ink?: string; ink2?: string; ink3?: string; line?: string;
  headerBg?: string; teal?: string; indigo?: string; rose?: string; leaf?: string; gold?: string;
  bodyFont?: string; headingFont?: string; baseSize?: number; headingWeight?: number; radius?: number; pageImage?: string; pageImageOpacity?: number;
};
export const FONTS = ["Inter", "Noto Sans", "Mukta", "Hind", "Poppins", "Nunito Sans", "Source Sans 3", "Lato", "Noto Serif", "Lora", "Merriweather", "EB Garamond", "Cormorant Garamond", "Playfair Display", "Gentium Book Plus", "Tiro Devanagari Sanskrit", "Noto Sans Oriya", "Noto Sans Bengali"];
export const THEME_DEFAULTS: Required<Pick<Theme, "primary" | "primaryDeep" | "primarySoft" | "page" | "band" | "surface" | "ink" | "ink2" | "ink3" | "line" | "headerBg" | "teal" | "indigo" | "rose" | "leaf" | "gold">> = {
  primary: "#853500", primaryDeep: "#6b2a00", primarySoft: "#f6ebe3", page: "#f6f4f1", band: "#eeeceb", surface: "#ffffff", ink: "#1f1a17", ink2: "#57504a", ink3: "#8a827b", line: "#e4ded8",
  headerBg: "#ffffff", teal: "#0b6b6f", indigo: "#3a4a9c", rose: "#a3365e", leaf: "#3b7a4b", gold: "#b9780a",
};
const VARS: [keyof Theme, string][] = [["primary", "--saffron"], ["primaryDeep", "--saffron-deep"], ["primarySoft", "--saffron-soft"], ["page", "--page"], ["band", "--band"], ["surface", "--surface"], ["ink", "--ink"], ["ink2", "--ink-2"], ["ink3", "--ink-3"], ["line", "--line"], ["headerBg", "--header-bg"], ["teal", "--teal"], ["indigo", "--indigo"], ["rose", "--rose-d"], ["leaf", "--leaf"], ["gold", "--gold"]];
const ok = (v: unknown) => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v);
const font = (f?: string) => (f && FONTS.includes(f) ? `"${f}", ` : "");

export function themeCss(t?: Theme | null): string {
  if (!t) return "";
  const vars = VARS.filter(([k]) => ok(t[k])).map(([k, v]) => `${v}:${t[k]}`);
  if (ok(t.primary)) vars.push(`--saffron-tint:color-mix(in srgb, ${t.primary} 5%, white)`, `--acc:${t.primary}`);
  if (ok(t.line)) vars.push(`--line-strong:color-mix(in srgb, ${t.line} 80%, black)`);
  let css = vars.length ? `:root{${vars.join(";")}}` : "";
  if (font(t.bodyFont)) css += `body,.font-serif,.reading{font-family:${font(t.bodyFont)}system-ui,sans-serif}`;
  if (font(t.headingFont)) css += `h1,h2,h3,h4{font-family:${font(t.headingFont)}system-ui,serif}`;
  if (t.headingWeight) css += `h1,h2,h3,h4{font-weight:${Math.min(900, Math.max(300, Number(t.headingWeight)))}}`;
  if (t.baseSize) css += `html{font-size:${Math.min(20, Math.max(13, Number(t.baseSize)))}px}`;
  if (t.radius !== undefined && t.radius !== null && String(t.radius) !== "") css += `.card,.rounded-2xl{border-radius:${Math.min(32, Math.max(0, Number(t.radius)))}px}`;
  if (t.pageImage && /^(\/|https:)/.test(t.pageImage)) css += `body{background-image:linear-gradient(color-mix(in srgb, var(--page) ${100 - Math.min(60, Number(t.pageImageOpacity ?? 10))}%, transparent),color-mix(in srgb, var(--page) ${100 - Math.min(60, Number(t.pageImageOpacity ?? 10))}%, transparent)),url("${t.pageImage.replace(/"/g, "")}");background-size:cover;background-attachment:fixed}`;
  return css;
}
export function fontHref(t?: Theme | null): string | null {
  const fams = Array.from(new Set([t?.bodyFont, t?.headingFont].filter((f): f is string => !!f && FONTS.includes(f) && f !== "Inter" && f !== "Gentium Book Plus")));
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`).join("&")}&display=swap` : null;
}
