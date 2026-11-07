"use client";
/* Fetching playlists and channels from the Studio, step by step: each request reads a little (about 40 seconds) and the
   next carries on where it stopped, so big channels never time out. A small panel shows every source's progress. */
import { useSyncExternalStore } from "react";
import { Check, Loader2, X, AlertTriangle } from "lucide-react";
import { api } from "../ui";

type Job = { id: string; name: string; state: "waiting" | "working" | "done" | "error"; found: number; added: number; left: number; error?: string };
let jobs: Job[] = []; let running = false; const subs = new Set<() => void>(); const after = new Set<() => void>();
const emit = () => { jobs = [...jobs]; subs.forEach((f) => f()); };
const set = (id: string, p: Partial<Job>) => { jobs = jobs.map((j) => (j.id === id ? { ...j, ...p } : j)); emit(); };

/** Queue sources to fetch (by id; names only for the panel). Runs one after another. */
export function fetchSources(list: { id: string; name?: string | null }[], onDone?: () => void) {
  if (onDone) after.add(onDone);
  for (const s of list) if (!jobs.some((j) => j.id === s.id && (j.state === "waiting" || j.state === "working"))) jobs = [...jobs.filter((j) => j.id !== s.id), { id: s.id, name: s.name || "Playlist", state: "waiting", found: 0, added: 0, left: 0 }];
  emit(); if (!running) run();
}
async function run() {
  running = true;
  for (let j = jobs.find((x) => x.state === "waiting"); j; j = jobs.find((x) => x.state === "waiting")) {
    set(j.id, { state: "working" }); let added = 0;
    for (let round = 0; round < 300; round++) {
      try {
        const r = await api<{ state: string; found: number; added: number; left: number; error?: string; name: string }>("/api/admin/videos/sources", "POST", { step: j.id });
        added += r.added; set(j.id, { name: r.name || j.name, found: r.found, added, left: r.left });
        if (r.state === "done") { set(j.id, { state: "done" }); break; }
        if (r.state === "error") { set(j.id, { state: "error", error: r.error }); break; }
      } catch (e: any) { // a dropped request: wait a moment and carry on where it stopped
        if (round > 3 && /not found/i.test(e.message)) { set(j.id, { state: "error", error: e.message }); break; }
        await new Promise((res) => setTimeout(res, 2500));
      }
    }
    after.forEach((f) => f());
  }
  running = false; after.forEach((f) => f()); after.clear();
}
const useJobs = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => jobs, () => jobs);

/** The floating progress panel; put it once on a page that fetches. */
export function FetchPanel() {
  const js = useJobs(); if (!js.length) return null;
  const busy = js.some((j) => j.state === "waiting" || j.state === "working");
  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.35)]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2.5">
        <p className="text-[12.5px] font-semibold">{busy ? "Fetching from YouTube…" : "Fetching finished"}</p>
        {!busy && <button onClick={() => { jobs = []; emit(); }} className="text-zinc-400 hover:text-zinc-900" aria-label="Close"><X className="size-4" /></button>}
      </div>
      <ul className="max-h-[50vh] divide-y divide-zinc-100 overflow-y-auto">
        {js.map((j) => (
          <li key={j.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
            <span className="mt-0.5">{j.state === "done" ? <Check className="size-4 text-emerald-600" /> : j.state === "error" ? <AlertTriangle className="size-4 text-red-600" /> : j.state === "working" ? <Loader2 className="size-4 animate-spin text-zinc-500" /> : <span className="block size-4 rounded-full border-2 border-zinc-200" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">{j.name}</span>
              <span className={`block text-[11.5px] ${j.state === "error" ? "text-red-600" : "text-zinc-500"}`}>{j.state === "error" ? j.error : j.state === "waiting" ? "Waiting…" : `${j.found.toLocaleString()} found · ${j.added.toLocaleString()} new${j.left && j.state === "working" ? ` · ${j.left.toLocaleString()} still to add` : ""}`}</span>
            </span>
          </li>))}
      </ul>
    </div>
  );
}
