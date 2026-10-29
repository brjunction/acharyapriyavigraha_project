import { MenusEditor } from "@/components/admin/menus-editor";
import { getSavedMenus } from "@/lib/menus-server";
import { toJson } from "@/lib/menus";
export default async function Page() { const saved = await getSavedMenus(); return <MenusEditor initial={saved?.length ? saved : toJson()} defaults={toJson()} />; }
