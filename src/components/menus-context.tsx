"use client";
import { createContext, useContext, useMemo } from "react";
import { hydrate, type MenuJ } from "@/lib/menus";
import { MENUS, type NavMenu } from "@/lib/nav";
import type { SimpleCfg } from "@/lib/simple-nav";

const Ctx = createContext<NavMenu[]>(MENUS);
const SimpleCtx = createContext<SimpleCfg | null>(null);
export function MenusProvider({ saved, simple = null, children }: { saved: MenuJ[] | null; simple?: SimpleCfg | null; children: React.ReactNode }) {
  const menus = useMemo(() => hydrate(saved), [saved]);
  return <Ctx.Provider value={menus}><SimpleCtx.Provider value={simple}>{children}</SimpleCtx.Provider></Ctx.Provider>;
}
export const useMenus = () => useContext(Ctx);
/** Editor choices for the Simple menu (icons, pictures, big buttons). */
export const useSimpleCfg = () => useContext(SimpleCtx);
