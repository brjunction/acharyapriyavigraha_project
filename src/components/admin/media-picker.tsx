"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Check } from "lucide-react";
import { Modal, Btn, api, toast } from "./ui";

type M = { id: string; filename: string; alt: string };
export function MediaPicker({ onPick, onClose, multiple }: { onPick: (items: { url: string; alt: string }[]) => void; onClose: () => void; multiple?: boolean }) {
  const [items, setItems] = useState<M[]>([]); const [sel, setSel] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const load = () => api<M[]>("/api/admin/media").then(setItems).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true);
    for (const f of Array.from(files)) { try { const fd = new FormData(); fd.append("file", f); await api("/api/admin/media", "POST", fd); } catch (e: any) { toast(`${f.name}: ${e.message}`, true); } }
    setBusy(false); load();
  };
  const toggle = (id: string) => setSel((s) => multiple ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id]);
  return (
    <Modal title="Choose a picture" onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Btn kind="soft" busy={busy} onClick={() => file.current?.click()}><Upload size={16} />Upload new pictures</Btn>
        <input ref={file} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        <span className="text-[12.5px] text-ink-3">PNG, JPG, WebP, GIF or SVG, up to 4 MB each.</span>
      </div>
      <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
        {items.map((m) => (
          <button key={m.id} onClick={() => toggle(m.id)} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-band ${sel.includes(m.id) ? "border-saffron" : "border-transparent hover:border-line-strong"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/media/${m.id}`} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
            {sel.includes(m.id) && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-white"><Check size={14} /></span>}
          </button>
        ))}
        {!items.length && <p className="col-span-full py-10 text-center text-[13px] text-ink-3">No pictures yet. Upload your first one.</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!sel.length} onClick={() => { onPick(sel.map((id) => ({ url: `/api/media/${id}`, alt: items.find((i) => i.id === id)?.alt || "" }))); onClose(); }}>Use {sel.length > 1 ? `${sel.length} pictures` : "this picture"}</Btn></div>
    </Modal>
  );
}
