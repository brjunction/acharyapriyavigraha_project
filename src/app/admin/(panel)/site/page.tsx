import { GripVertical, Eye, EyeOff, Pencil, Plus } from "lucide-react";

const BLOCKS = [["Banner slideshow", true], ["Search panel", true], ["Welcome: Śrīla Prabhupāda and Śrīla Gurudeva", true], ["For today: quote, Daily Diary, this day", true], ["Archive tiles", true], ["Explore by subject", true], ["Recently added", true], ["Translations", true], ["Gratitude and Thank List", true], ["Announcement bar", false]] as const;

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-[24px]">Home page</h1><p className="text-[13.5px] text-ink-3">Drag to reorder, switch blocks on or off, and click a block to edit it.</p></div>
        <button className="btn btn-primary !rounded-xl">Publish changes</button>
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ul className="space-y-2">
          {BLOCKS.map(([name, on], i) => (
            <li key={name} className={`card flex items-center gap-3 px-4 py-3.5 ${i === 3 ? "!border-saffron ring-2 ring-saffron/15" : ""} ${on ? "" : "opacity-60"}`}>
              <GripVertical size={16} className="cursor-grab text-ink-3" /><span className="flex h-7 w-7 items-center justify-center rounded-md bg-band text-[12px] text-ink-3">{i + 1}</span>
              <span className="flex-1 text-[14px] font-medium">{name}</span>{on ? <Eye size={16} className="text-ok" /> : <EyeOff size={16} className="text-ink-3" />}<Pencil size={15} className="text-ink-3" />
            </li>
          ))}
          <li><button className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-line-strong py-3 text-[13.5px] text-ink-3 hover:border-saffron hover:text-saffron"><Plus size={15} />Add block</button></li>
        </ul>
        <div className="card space-y-4 p-5 text-[13.5px]">
          <p className="font-semibold">Edit: For today</p>
          <label className="block"><span className="mb-1 block text-[12px] text-ink-3">Title</span><input className="h-9 w-full rounded-lg border border-line bg-page px-3" defaultValue="For today" /></label>
          <label className="block"><span className="mb-1 block text-[12px] text-ink-3">Quote of the day</span><select className="h-9 w-full rounded-lg border border-line bg-page px-2"><option>Automatic, changes daily</option><option>Choose a quote</option></select></label>
          <label className="block"><span className="mb-1 block text-[12px] text-ink-3">Daily Diary source</span><select className="h-9 w-full rounded-lg border border-line bg-page px-2"><option>Śrīla Haladhara Swāmī Guru Mahārāja, Shorts</option></select></label>
          <label className="flex items-center justify-between"><span>Show “This day in his life”</span><input type="checkbox" defaultChecked className="accent-[var(--saffron)]" /></label>
        </div>
      </div>
    </div>
  );
}
