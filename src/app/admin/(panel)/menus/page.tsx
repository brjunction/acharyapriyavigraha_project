import { MenusEditor, SimpleMenuEditor } from "@/components/admin/menus-editor";
import { getSavedMenus, getSimpleCfg } from "@/lib/menus-server";
import { toJson } from "@/lib/menus";
export default async function Page() {
  const [saved, simple] = await Promise.all([getSavedMenus(), getSimpleCfg()]);
  return (
    <div>
      <div className="mb-6"><h1 className="text-[26px] font-bold tracking-[-0.03em]">Website menus</h1><p className="text-ink-3">Visitors choose between the Simple menu (shown first) and the Advanced menu with the switch at the top of the website.</p></div>
      <SimpleMenuEditor initial={simple || {}} />
      <MenusEditor initial={saved?.length ? saved : toJson()} defaults={toJson()} />
    </div>
  );
}
