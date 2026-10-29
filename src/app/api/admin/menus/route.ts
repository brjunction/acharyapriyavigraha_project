import { guard, json } from "@/lib/api";
import { getSavedMenus } from "@/lib/menus-server";
import { toJson } from "@/lib/menus";

/** The website menus (saved ones, or the built-in ones) for the Studio sidebar. */
export async function GET() {
  const g = await guard("viewer"); if ("res" in g) return g.res;
  const saved = await getSavedMenus();
  return json((saved?.length ? saved : toJson()).filter((m) => !m.hidden));
}
