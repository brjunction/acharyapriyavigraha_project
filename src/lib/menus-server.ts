import { cache } from "react";
import { sql, hasDb } from "./db";
import { hydrate, type MenuJ } from "./menus";

export const getSavedMenus = cache(async (): Promise<MenuJ[] | null> => {
  if (!hasDb()) return null;
  try { const r = await sql`select value from settings where key = 'menus'`; return (r[0]?.value as MenuJ[]) || null; } catch { return null; }
});
export const getMenus = async () => hydrate(await getSavedMenus());
