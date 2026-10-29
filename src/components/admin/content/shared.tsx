"use client";
import { useEffect, useRef, useState } from "react";
import { X, Headphones } from "lucide-react";
import { Badge, Input, api } from "../ui";

export function TopicsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [t, setT] = useState(""); const [opts, setOpts] = useState<string[]>([]);
  useEffect(() => { api<{ name: string }[]>("/api/admin/vocab?kind=topic").then((r) => setOpts(r.map((x) => x.name))).catch(() => {}); }, []);
  const add = (x: string) => { const y = x.trim(); if (y && !value.includes(y)) onChange([...value, y]); setT(""); };
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 shadow-xs focus-within:ring-[3px] focus-within:ring-zinc-400/30">
      {value.map((x) => <Badge key={x} tone="outline">{x}<button onClick={() => onChange(value.filter((y) => y !== x))}><X /></button></Badge>)}
      <input list="topic-list" value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(t); } }} onBlur={() => t && add(t)} placeholder={value.length ? "" : "Type a topic and press Enter"} className="min-w-[140px] flex-1 bg-transparent text-[14px] outline-none" />
      <datalist id="topic-list">{opts.filter((o) => !value.includes(o)).map((o) => <option key={o} value={o} />)}</datalist>
    </div>
  );
}

/** Choose a lecture from the Audio archive. */
export function LecturePicker({ value, label, onChange }: { value?: string | null; label?: string | null; onChange: (id: string | null, title: string | null) => void }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState<{ id: string; title: string; date: string | null; place: string | null }[]>([]); const [open, setOpen] = useState(false); const t = useRef<any>(null);
  useEffect(() => { if (!open) return; clearTimeout(t.current); t.current = setTimeout(() => api(`/api/admin/audios/pick?q=${encodeURIComponent(q)}`).then(setRes).catch(() => {}), 200); }, [q, open]);
  if (value && !open) return <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px]"><Headphones className="size-4 text-zinc-500" /><span className="flex-1 truncate">{label || "Linked lecture"}</span><button onClick={() => setOpen(true)} className="text-[13px] text-zinc-600 underline">Change</button><button onClick={() => onChange(null, null)} className="text-zinc-400"><X className="size-4" /></button></div>;
  return (
    <div className="relative">
      <Input value={q} onFocus={() => setOpen(true)} onChange={(e) => setQ(e.target.value)} placeholder="Search a lecture by title, place or date…" />
      {open && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white p-1 shadow-lg">{res.map((r) => <button key={r.id} onMouseDown={() => { onChange(r.id, r.title); setOpen(false); setQ(""); }} className="block w-full rounded px-2.5 py-1.5 text-left text-[13.5px] hover:bg-zinc-100"><span className="font-medium">{r.title}</span><span className="ml-2 text-[12px] text-zinc-500">{[r.date?.slice(0, 10), r.place].filter(Boolean).join(" · ")}</span></button>)}{!res.length && <p className="px-2.5 py-2 text-[13px] text-zinc-500">No lectures found.</p>}<button onMouseDown={() => setOpen(false)} className="w-full px-2.5 py-1.5 text-left text-[12.5px] text-zinc-500">Close</button></div>}
    </div>
  );
}
