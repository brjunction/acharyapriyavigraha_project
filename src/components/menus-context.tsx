"use client";
import { createContext, useContext, useMemo } from "react";
import { hydrate, type MenuJ } from "@/lib/menus";
import { MENUS, type NavMenu } from "@/lib/nav";

const Ctx = createContext<NavMenu[]>(MENUS);
export function MenusProvider({ saved, children }: { saved: MenuJ[] | null; children: React.ReactNode }) {
  const menus = useMemo(() => hydrate(saved), [saved]);
  return <Ctx.Provider value={menus}>{children}</Ctx.Provider>;
}
export const useMenus = () => useContext(Ctx);
