import { GripVertical, Eye, EyeOff, Pencil, Plus } from "lucide-react";

const BLOCKS = [["Hero: portrait, verse & search", true], ["Today: quote · Daily Diary · this day", true], ["Continue listening", true], ["The three pillars", true], ["Explore by topic", true], ["Śrīla Gurudeva blocks", true], ["Recently added", true], ["Languages", true], ["Gratitude & Thank List", true], ["Announcement bar", false]] as const;

export default function SiteBuilder() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-serif text-3xl">Home page builder</h1><p className="text-sm text-ink-3">Drag to reorder. Turn blocks on or off. Click a block to edit its text, image and featured items.</p></div>
        <button className="rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-paper">Publish changes</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-2">
          {BLOCKS.map(([name, on], i) => (
            <li key={name} className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 ${i === 1 ? "border-gold ring-2 ring-gold/20" : "border-line"} ${on ? "" : "opacity-60"}`}>
              <GripVertical size={16} className="cursor-grab text-ink-3" />
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-paper-2 text-xs text-ink-3">{i + 1}</span>
              <span className="flex-1 text-sm font-medium">{name}</span>
              {on ? <Eye size={16} className="text-tulasi" /> : <EyeOff size={16} className="text-ink-3" />}
              <Pencil size={15} className="text-ink-3" />
            </li>
          ))}
          <li><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm text-ink-3 hover:border-gold"><Plus size={15} />Add block</button></li>
        </ul>
        <div className="space-y-4 rounded-xl border border-line bg-card p-5 text-sm">
          <p className="font-medium">Edit: Today</p>
          <label className="block"><span className="mb-1 block text-xs text-ink-3">Section title</span><input className="h-9 w-full rounded-lg border border-line bg-paper px-3" defaultValue="Today" /></label>
          <label className="block"><span className="mb-1 block text-xs text-ink-3">Quote of the day</span><select className="h-9 w-full rounded-lg border border-line bg-paper px-2"><option>Automatic (rotates daily)</option><option>Choose a quote…</option></select></label>
          <label className="block"><span className="mb-1 block text-xs text-ink-3">Daily Diary source</span><select className="h-9 w-full rounded-lg border border-line bg-paper px-2"><option>HH Haladhara Swāmī Mahārāja · Shorts</option></select></label>
          <label className="flex items-center justify-between"><span>Show “This day in his life”</span><input type="checkbox" defaultChecked className="accent-[var(--saffron)]" /></label>
        </div>
      </div>
    </div>
  );
}
