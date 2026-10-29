"use client";
import { useEffect, useState } from "react";
import { BookMarked, ArrowUp, ArrowDown, Trash2, Plus, ExternalLink, GripVertical } from "lucide-react";
import { SOURCES, type FSection } from "@/lib/folio-sources";
import { Btn, Card, Input, Select, PageHeader, api, toast } from "../ui";

export function FolioPanel() {
  const [s, setS] = useState<FSection[] | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { api<FSection[]>("/api/admin/folio").then(setS).catch((e) => toast(e.message, true)); }, []);
  if (!s) return <p className="text-zinc-500">Opening…</p>;
  const mv = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= s.length) return; const c = [...s]; [c[i], c[j]] = [c[j], c[i]]; setS(c); };
  return (
    <div>
      <PageHeader icon={BookMarked} title="WebFolio" description="The whole archive as one document, like a folio: a contents tree on the left and every text on the right, searchable with F2. It is built from the same lectures, books and pages, so nothing is entered twice.">
        <a href="/webfolio" target="_blank"><Btn><ExternalLink />Open WebFolio</Btn></a><Btn kind="primary" busy={busy} onClick={async () => { setBusy(true); try { await api("/api/admin/folio", "PUT", { sections: s }); toast("Saved."); } catch (e: any) { toast(e.message, true); } finally { setBusy(false); } }}>Save</Btn>
      </PageHeader>
      <p className="mb-3 text-[14px] font-medium">Sections, in the order readers see them</p>
      <Card className="divide-y divide-zinc-100">{s.map((x, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          <GripVertical className="size-4 text-zinc-300" />
          <input type="checkbox" checked={x.enabled} onChange={(e) => setS(s.map((y, j) => (j === i ? { ...y, enabled: e.target.checked } : y)))} className="size-4 accent-zinc-900" title="Show this section" />
          <Input value={x.title} onChange={(e) => setS(s.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} className="!w-60" />
          <Select value={x.source} onChange={(e) => setS(s.map((y, j) => (j === i ? { ...y, source: e.target.value } : y)))} className="!w-80">{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          <span className="ml-auto flex gap-1"><Btn size="icon" onClick={() => mv(i, -1)}><ArrowUp /></Btn><Btn size="icon" onClick={() => mv(i, 1)}><ArrowDown /></Btn><Btn size="icon" onClick={() => setS(s.filter((_, j) => j !== i))}><Trash2 /></Btn></span>
        </div>))}</Card>
      <Btn className="mt-3" onClick={() => setS([...s, { title: "New section", source: "pages", enabled: true, position: s.length }])}><Plus />Add a section</Btn>
    </div>
  );
}
