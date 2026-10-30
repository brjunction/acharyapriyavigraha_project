"use client";
import { useEffect, useState } from "react";
import { Download, Check, Loader2, HardDriveDownload, Monitor, Trash2, Headphones } from "lucide-react";

const ready = () => typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;
export function useOffline() { useEffect(() => { if (ready()) navigator.serviceWorker.register("/webfolio/sw.js", { scope: "/webfolio" }).catch(() => {}); }, []); }
export function RegisterSW() { useOffline(); return null; }

/** Keep one lecture on this device to listen without internet. */
export function SaveAudio({ url, title }: { url: string; title: string }) {
  const [st, setSt] = useState<"" | "busy" | "done">("");
  useEffect(() => { if (ready()) caches.open("wf-audio-v1").then((c) => c.match(url)).then((h) => h && setSt("done")).catch(() => {}); }, [url]);
  const save = async () => { setSt("busy"); try { const r = await fetch(url, { mode: "cors" }).catch(() => fetch(url, { mode: "no-cors" })); const c = await caches.open("wf-audio-v1"); await c.put(url, r); const list = JSON.parse(localStorage.getItem("wf_audio") || "[]"); localStorage.setItem("wf_audio", JSON.stringify([...list.filter((x: any) => x.url !== url), { url, title, at: Date.now() }])); setSt("done"); } catch { setSt(""); alert("This recording could not be saved. Its server may not allow it."); } };
  return <button onClick={save} disabled={st !== ""} className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-70">{st === "done" ? <Check size={14} /> : st === "busy" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}{st === "done" ? "Saved for offline" : st === "busy" ? "Saving…" : "Save for offline"}</button>;
}

/** The download page: install as an app, keep all text, saved lectures, and a single file. */
export function OfflinePanel() {
  useOffline();
  const [prompt, setPrompt] = useState<any>(null); const [installed, setInstalled] = useState(false); const [prog, setProg] = useState<[number, number] | null>(null); const [usage, setUsage] = useState(""); const [audio, setAudio] = useState<{ url: string; title: string }[]>([]); const [kept, setKept] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: any) => { e.preventDefault(); setPrompt(e); }; window.addEventListener("beforeinstallprompt", h);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    try { setAudio(JSON.parse(localStorage.getItem("wf_audio") || "[]")); setKept(localStorage.getItem("wf_kept")); } catch {}
    navigator.storage?.estimate?.().then((x) => setUsage(`${((x.usage || 0) / 1048576).toFixed(0)} MB used on this device`)).catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const keepAll = async () => {
    if (!ready()) return alert("This browser cannot keep pages offline.");
    const { urls } = await (await fetch("/api/webfolio/urls")).json(); const c = await caches.open("wf-pages-v1"); const f = await caches.open("wf-files-v1"); const assets = new Set<string>(); let done = 0; setProg([0, urls.length]);
    const one = async (u: string) => { try { const r = await fetch(u); if (r.ok) { const html = await r.clone().text(); for (const m of html.matchAll(/(\/_next\/static\/[^"'\s)]+)/g)) assets.add(m[1]); await c.put(u, r); } } catch {} setProg([++done, urls.length]); };
    for (let i = 0; i < urls.length; i += 4) await Promise.all(urls.slice(i, i + 4).map(one));
    for (const a of assets) { if (!(await f.match(a))) { try { const r = await fetch(a); if (r.ok) await f.put(a, r); } catch {} } }
    localStorage.setItem("wf_kept", new Date().toISOString()); setKept(new Date().toISOString()); navigator.storage?.persist?.();
    navigator.storage?.estimate?.().then((x) => setUsage(`${((x.usage || 0) / 1048576).toFixed(0)} MB used on this device`));
  };
  const card = "rounded-xl border border-zinc-200 p-5";
  return (
    <div className="space-y-4">
      <div className={card}><div className="flex items-start gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100"><Monitor size={18} /></span><div className="flex-1">
        <h2 className="text-[16px] font-semibold text-zinc-950">Install as an app</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">WebFolio installs like a program on Windows (from Edge or Chrome), on a Mac, and on Android or iPhone. It opens in its own window from the Start menu or home screen, and works without internet once its text is kept.</p>
        {installed ? <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"><Check size={15} />Installed — you are using the app.</p> : prompt ? <button onClick={async () => { prompt.prompt(); const r = await prompt.userChoice; if (r.outcome === "accepted") setInstalled(true); }} className="mt-3 h-9 rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white">Install WebFolio</button>
          : <ul className="mt-3 space-y-1 text-[12.5px] text-zinc-600"><li><b className="text-zinc-800">Windows (Edge or Chrome):</b> the install icon at the right of the address bar, or menu ⋯ → Apps → Install this site as an app.</li><li><b className="text-zinc-800">iPhone / iPad (Safari):</b> Share → Add to Home Screen.</li><li><b className="text-zinc-800">Android (Chrome):</b> menu ⋮ → Install app.</li></ul>}
      </div></div></div>
      <div className={card}><div className="flex items-start gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100"><HardDriveDownload size={18} /></span><div className="flex-1">
        <h2 className="text-[16px] font-semibold text-zinc-950">Keep all text offline</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">Saves every section, book, compilation, diary year and transcription on this device, so the whole WebFolio reads without internet. Run it again later to bring in what is new.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={keepAll} disabled={!!prog && prog[0] < prog[1]} className="h-9 rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white disabled:opacity-60">{prog && prog[0] < prog[1] ? "Saving…" : kept ? "Update offline copy" : "Keep all text offline"}</button>
          {prog && <span className="text-[12.5px] tabular-nums text-zinc-600">{prog[0].toLocaleString()} of {prog[1].toLocaleString()} pages</span>}
          {!prog && kept && <span className="text-[12.5px] text-zinc-500">Last kept {new Date(kept).toLocaleDateString()}</span>}
        </div>
        {prog && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full bg-zinc-900 transition-all" style={{ width: `${(prog[0] / Math.max(1, prog[1])) * 100}%` }} /></div>}
        {usage && <p className="mt-2 text-[12px] text-zinc-400">{usage}</p>}
      </div></div></div>
      <div className={card}><div className="flex items-start gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100"><Headphones size={18} /></span><div className="flex-1">
        <h2 className="text-[16px] font-semibold text-zinc-950">Lectures saved for listening</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">On any lecture page, “Save for offline” keeps the recording on this device. Videos stay online.</p>
        {audio.length ? <ul className="mt-3 divide-y divide-zinc-100 rounded-lg border border-zinc-100">{audio.map((a) => <li key={a.url} className="flex items-center gap-3 px-3 py-2 text-[13px]"><span className="min-w-0 flex-1 truncate">{a.title}</span><button onClick={async () => { (await caches.open("wf-audio-v1")).delete(a.url); const n = audio.filter((x) => x.url !== a.url); setAudio(n); localStorage.setItem("wf_audio", JSON.stringify(n)); }} className="text-zinc-400 hover:text-red-600" title="Remove"><Trash2 size={14} /></button></li>)}</ul> : <p className="mt-3 text-[12.5px] text-zinc-400">None saved yet.</p>}
      </div></div></div>
      <div className={card}><div className="flex items-start gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100"><Download size={18} /></span><div className="flex-1">
        <h2 className="text-[16px] font-semibold text-zinc-950">Download as one file</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-600">All the text in a single web page you can keep, copy to a USB stick, print or open on any computer.</p>
        <a href="/api/webfolio/export" className="mt-3 inline-flex h-9 items-center rounded-lg border border-zinc-200 px-4 text-[13px] font-medium text-zinc-800 hover:bg-zinc-50">Download WebFolio (.html)</a>
      </div></div></div>
    </div>
  );
}
