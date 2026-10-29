"use client";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, Eye, EyeOff, RotateCcw, ChevronDown } from "lucide-react";
import { ICONS, isImgIcon, type MenuJ, type MenuLinkJ } from "@/lib/menus";
import { MediaPicker } from "./media-picker";
import { Btn, api, toast } from "./ui";

const box = "h-8 w-full rounded-lg border border-transparent bg-transparent px-2 text-[13.5px] outline-none hover:border-line focus:border-saffron focus:bg-white";
function mv<T>(a: T[], i: number, d: number) { const j = i + d; if (j < 0 || j >= a.length) return a; const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c; }

function IconPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const [media, setMedia] = useState(false); const I = ICONS[value] || ICONS.FileText;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} title="Change icon" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-line bg-white text-saffron hover:border-saffron">{isImgIcon(value) ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-6 w-6 object-contain" /> : <I size={16} />}</button>
      {open && <div className="absolute left-0 top-9 z-30 w-[300px] rounded-xl border border-line bg-white p-2 shadow-xl" onMouseLeave={() => !media && setOpen(false)}>
        <button onClick={() => setMedia(true)} className="mb-2 w-full rounded-lg bg-band py-1.5 text-[12.5px] font-medium hover:brightness-95">Upload your own picture as the icon</button>
        <div className="grid grid-cols-9 gap-1">{Object.entries(ICONS).map(([k, C]) => <button key={k} title={k} onClick={() => { onChange(k); setOpen(false); }} className={`flex h-7 w-7 items-center justify-center rounded ${k === value ? "bg-saffron text-white" : "hover:bg-band"}`}><C size={15} /></button>)}</div></div>}
      {media && <MediaPicker onClose={() => setMedia(false)} onPick={(i) => { onChange(i[0].url); setMedia(false); setOpen(false); }} />}
    </div>
  );
}

export function MenusEditor({ initial, defaults }: { initial: MenuJ[]; defaults: MenuJ[] }) {
  const [menus, setMenus] = useState<MenuJ[]>(initial); const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string>(initial[0]?.key); const [paths, setPaths] = useState<string[]>([]);
  useEffect(() => { api<{ path: string }[]>("/api/admin/pages").then((p) => setPaths(p.map((x) => x.path))).catch(() => {}); }, []);
  const set = (fn: (m: MenuJ[]) => MenuJ[]) => { setMenus((m) => fn(structuredClone(m))); setDirty(true); };
  const save = async () => { setBusy(true); try { await api("/api/admin/settings", "PUT", { menus }); setDirty(false); toast("Menus saved. The website shows them now."); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } };
  const allHrefs = Array.from(new Set([...paths, ...defaults.flatMap((m) => [m.href, ...m.groups.flatMap((g) => g.links.map((l) => l.href))])])).sort();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-[28px] font-bold tracking-[-0.03em]">Website menus</h1><p className="text-ink-3">The menus at the top of the website. Change names, descriptions, icons and links; add or hide items.</p></div>
        <div className="flex gap-2"><Btn onClick={() => { if (confirm("Put every menu back to the original?")) { setMenus(defaults); setDirty(true); } }}><RotateCcw size={15} />Original</Btn><Btn kind="primary" busy={busy} disabled={!dirty} onClick={save}>Save menus</Btn></div>
      </div>
      <datalist id="hrefs">{allHrefs.map((h) => <option key={h} value={h} />)}</datalist>
      <div className="space-y-3">
        {menus.map((m, mi) => (
          <div key={m.key} className={`rounded-2xl border ${m.hidden ? "border-dashed border-line-strong opacity-60" : "border-line"} bg-white`}>
            <div className="flex items-center gap-2 p-3">
              <IconPick value={m.icon} onChange={(v) => set((x) => { x[mi].icon = v; return x; })} />
              <input className={`${box} !h-9 max-w-[260px] text-[16px] font-bold`} value={m.label} onChange={(e) => set((x) => { x[mi].label = e.target.value; return x; })} />
              <span className="text-[12.5px] text-ink-3">{m.groups.reduce((n, g) => n + g.links.length, 0)} items</span>
              <span className="ml-auto flex items-center gap-1">
                <button title="Move left" onClick={() => set((x) => mv(x, mi, -1))} className="rounded p-1.5 text-ink-3 hover:bg-band"><ArrowUp size={15} /></button>
                <button title="Move right" onClick={() => set((x) => mv(x, mi, 1))} className="rounded p-1.5 text-ink-3 hover:bg-band"><ArrowDown size={15} /></button>
                <button title={m.hidden ? "Show on website" : "Hide from website"} onClick={() => set((x) => { x[mi].hidden = !x[mi].hidden; return x; })} className="rounded p-1.5 text-ink-3 hover:bg-band">{m.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button onClick={() => setOpen(open === m.key ? "" : m.key)} className="rounded p-1.5 text-ink-3 hover:bg-band"><ChevronDown size={16} className={`transition ${open === m.key ? "rotate-180" : ""}`} /></button>
              </span>
            </div>
            {open === m.key && <div className="border-t border-line p-3 sm:p-4">
              <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_200px]">
                <label className="text-[12px] font-semibold text-ink-3">Short line under the menu<input className={`${box} border-line bg-white font-normal text-ink`} value={m.intro} onChange={(e) => set((x) => { x[mi].intro = e.target.value; return x; })} /></label>
                <label className="text-[12px] font-semibold text-ink-3">Menu goes to<input list="hrefs" className={`${box} border-line bg-white font-normal text-ink`} value={m.href} onChange={(e) => set((x) => { x[mi].href = e.target.value; return x; })} /></label>
                <label className="text-[12px] font-semibold text-ink-3">“All” button words<input className={`${box} border-line bg-white font-normal text-ink`} value={m.allLabel || ""} onChange={(e) => set((x) => { x[mi].allLabel = e.target.value; return x; })} /></label>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {m.groups.map((g, gi) => (
                  <div key={gi} className="rounded-xl bg-[#faf6f0] p-2.5">
                    <div className="mb-1 flex items-center gap-1"><input className={`${box} text-[12px] font-bold uppercase tracking-[0.1em] text-saffron`} value={g.title} onChange={(e) => set((x) => { x[mi].groups[gi].title = e.target.value; return x; })} />
                      <button title="Move up" onClick={() => set((x) => { x[mi].groups = mv(x[mi].groups, gi, -1); return x; })} className="rounded p-1 text-ink-3 hover:bg-white"><ArrowUp size={14} /></button>
                      <button title="Move down" onClick={() => set((x) => { x[mi].groups = mv(x[mi].groups, gi, 1); return x; })} className="rounded p-1 text-ink-3 hover:bg-white"><ArrowDown size={14} /></button>
                      <button title="Delete group" onClick={() => confirm(`Delete the group “${g.title}”?`) && set((x) => { x[mi].groups.splice(gi, 1); return x; })} className="rounded p-1 text-[#a3281e] hover:bg-white"><Trash2 size={14} /></button></div>
                    {g.links.map((l, li) => {
                      const up = (p: Partial<MenuLinkJ>) => set((x) => { Object.assign(x[mi].groups[gi].links[li], p); return x; });
                      return (
                        <div key={li} className={`group flex items-start gap-1.5 rounded-lg p-1 hover:bg-white ${l.hidden ? "opacity-50" : ""}`}>
                          <IconPick value={l.icon} onChange={(v) => up({ icon: v })} />
                          <div className="min-w-0 flex-1">
                            <input className={`${box} font-semibold text-ink`} value={l.label} onChange={(e) => up({ label: e.target.value })} placeholder="Name" />
                            <input className={`${box} !h-7 text-[12.5px] text-ink-3`} value={l.desc} onChange={(e) => up({ desc: e.target.value })} placeholder="Short description" />
                            <input list="hrefs" className={`${box} !h-7 text-[12px] text-[#2a4f9a]`} value={l.href} onChange={(e) => up({ href: e.target.value })} placeholder="/page-address or https://…" />
                          </div>
                          <div className="flex flex-col items-center opacity-0 group-hover:opacity-100">
                            <button title="Move up" onClick={() => set((x) => { const L = x[mi].groups[gi].links; x[mi].groups[gi].links = mv(L, li, -1); return x; })} className="p-0.5 text-ink-3"><ArrowUp size={13} /></button>
                            <button title="Move down" onClick={() => set((x) => { const L = x[mi].groups[gi].links; x[mi].groups[gi].links = mv(L, li, 1); return x; })} className="p-0.5 text-ink-3"><ArrowDown size={13} /></button>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <button title={l.soon ? "Marked “soon”" : "Mark as “soon”"} onClick={() => up({ soon: !l.soon })} className={`rounded px-1 text-[10px] font-semibold ${l.soon ? "bg-band text-ink-2" : "text-ink-3 opacity-0 group-hover:opacity-100"}`}>soon</button>
                            <button title={l.hidden ? "Show" : "Hide"} onClick={() => up({ hidden: !l.hidden })} className="p-0.5 text-ink-3 opacity-0 group-hover:opacity-100">{l.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                            <button title="Delete" onClick={() => set((x) => { x[mi].groups[gi].links.splice(li, 1); return x; })} className="p-0.5 text-[#a3281e] opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => set((x) => { x[mi].groups[gi].links.push({ href: "/", label: "New item", desc: "", icon: "FileText" }); return x; })} className="mt-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink-3 hover:bg-white hover:text-saffron"><Plus size={13} />Add item</button>
                  </div>
                ))}
                <button onClick={() => set((x) => { x[mi].groups.push({ title: "New group", links: [] }); return x; })} className="flex min-h-[80px] items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-[13.5px] font-medium text-ink-3 hover:border-saffron hover:text-saffron"><Plus size={15} />Add a group</button>
              </div>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}
