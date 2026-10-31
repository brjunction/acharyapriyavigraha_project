"use client";
import { BLESSINGS } from "@/components/home/blessing";
import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Plus, Copy } from "lucide-react";
import { Btn, Field, Input, Modal, Select, Textarea, api, toast } from "./ui";

const Head = ({ t, s, children }: { t: string; s: string; children?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-[26px] font-bold tracking-[-0.03em]">{t}</h1><p className="text-ink-3">{s}</p></div>{children}</div>
);

export function MediaLibrary() {
  const [items, setItems] = useState<any[] | null>(null); const [busy, setBusy] = useState(false); const ref = useRef<HTMLInputElement>(null);
  const load = () => api<any[]>("/api/admin/media").then(setItems).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const up = async (files: FileList | null) => {
    if (!files) return; setBusy(true);
    for (const f of Array.from(files)) { const fd = new FormData(); fd.append("file", f); try { await api("/api/admin/media", "POST", fd); } catch (e: any) { toast(`${f.name}: ${e.message}`, true); } }
    setBusy(false); load();
  };
  return (
    <div>
      <Head t="Pictures" s="Upload PNG or JPG pictures once, then use them on any page."><Btn kind="primary" busy={busy} onClick={() => ref.current?.click()}><Upload size={16} />Upload pictures</Btn></Head>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => up(e.target.files)} />
      {!items ? <p className="text-ink-3">Loading…</p> : !items.length ? <div className="card p-10 text-center text-ink-3">No pictures yet.</div> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map((m) => (
          <div key={m.id} className="card overflow-hidden"><div className="aspect-square bg-band">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/media/${m.id}`} alt={m.alt} className="h-full w-full object-contain" /></div>
            <div className="space-y-1.5 p-2.5"><Input defaultValue={m.alt} placeholder="Describe the picture" onBlur={(e) => e.target.value !== m.alt && api(`/api/admin/media/${m.id}`, "PATCH", { alt: e.target.value }).then(() => toast("Saved."))} />
              <div className="flex justify-between"><button title="Copy address" onClick={() => { navigator.clipboard.writeText(`/api/media/${m.id}`); toast("Address copied."); }} className="p-1 text-ink-3 hover:text-saffron"><Copy size={15} /></button>
                <button title="Delete" onClick={async () => { if (confirm("Delete this picture? Pages using it will show a blank space.")) { await api(`/api/admin/media/${m.id}`, "DELETE"); load(); } }} className="p-1 text-[#a3281e]"><Trash2 size={15} /></button></div></div></div>))}</div>)}
    </div>
  );
}

const KINDS = [["notice", "Notice"], ["event", "Event"], ["new", "New on the site"], ["urgent", "Important"]];
export function Announcements() {
  const [rows, setRows] = useState<any[] | null>(null); const [ed, setEd] = useState<any | null>(null);
  const load = () => api<any[]>("/api/admin/announcements").then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const save = async () => { try { ed.id ? await api(`/api/admin/announcements/${ed.id}`, "PATCH", ed) : await api("/api/admin/announcements", "POST", ed); setEd(null); load(); toast("Saved."); } catch (e: any) { toast(e.message, true); } };
  const set = (k: string, v: any) => setEd({ ...ed, [k]: v });
  return (
    <div>
      <Head t="Announcements" s="A pop-up that each visitor sees once. The newest active one is shown."><Btn kind="primary" onClick={() => setEd({ title: "", body: "", kind: "notice", active: true })}><Plus size={16} />New announcement</Btn></Head>
      <div className="card divide-y divide-line">{!rows ? <p className="p-5 text-ink-3">Loading…</p> : !rows.length ? <p className="p-6 text-ink-3">Nothing yet.</p> : rows.map((r) => (
        <div key={r.id} className="flex items-center gap-3 px-4 py-3"><button className="min-w-0 flex-1 text-left" onClick={() => setEd({ ...r, starts_at: r.starts_at?.slice(0, 10) || "", ends_at: r.ends_at?.slice(0, 10) || "" })}><b>{r.title}</b><span className="block truncate text-[12.5px] text-ink-3">{r.body}</span></button>
          <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${r.active ? "bg-[#e3f3e6] text-[#256a39]" : "bg-band text-ink-3"}`}>{r.active ? "Showing" : "Off"}</span>
          <button onClick={async () => { if (confirm("Delete this announcement?")) { await api(`/api/admin/announcements/${r.id}`, "DELETE"); load(); } }} className="text-[#a3281e]"><Trash2 size={16} /></button></div>))}</div>
      {ed && <Modal title={ed.id ? "Edit announcement" : "New announcement"} onClose={() => setEd(null)}><div className="space-y-3.5">
        <Field label="Title"><Input value={ed.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Message"><Textarea value={ed.body} onChange={(e) => set("body", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Kind"><Select value={ed.kind} onChange={(e) => set("kind", e.target.value)}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          <Field label="Showing"><Select value={ed.active ? "1" : "0"} onChange={(e) => set("active", e.target.value === "1")}><option value="1">On</option><option value="0">Off</option></Select></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Button words (optional)"><Input value={ed.cta_label || ""} onChange={(e) => set("cta_label", e.target.value)} /></Field><Field label="Button goes to"><Input value={ed.cta_url || ""} onChange={(e) => set("cta_url", e.target.value)} placeholder="/page or https://" /></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Show from"><Input type="date" value={ed.starts_at || ""} onChange={(e) => set("starts_at", e.target.value)} /></Field><Field label="Show until"><Input type="date" value={ed.ends_at || ""} onChange={(e) => set("ends_at", e.target.value)} /></Field></div>
        <div className="flex justify-end gap-2"><Btn onClick={() => setEd(null)}>Cancel</Btn><Btn kind="primary" onClick={save}>Save</Btn></div></div></Modal>}
    </div>
  );
}

const ROLES = [["owner", "Owner: everything"], ["admin", "Admin: manage people and settings"], ["editor", "Editor: publish anything"], ["contributor", "Contributor: write drafts"], ["viewer", "Viewer: look only"]];
export function UsersAdmin() {
  const [rows, setRows] = useState<any[] | null>(null); const [nw, setNw] = useState<any | null>(null);
  const load = () => api<any[]>("/api/admin/users").then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);
  const patch = (id: string, b: any) => api(`/api/admin/users/${id}`, "PATCH", b).then(() => { toast("Saved."); load(); }).catch((e) => toast(e.message, true));
  return (
    <div>
      <Head t="People & roles" s="Choose who can write, publish or manage."><Btn kind="primary" onClick={() => setNw({ name: "", email: "", password: "", role: "editor" })}><Plus size={16} />Add a person</Btn></Head>
      <div className="card divide-y divide-line">{!rows ? <p className="p-5 text-ink-3">Loading…</p> : rows.map((u) => (
        <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><b>{u.name || u.email}</b><span className="block text-[12.5px] text-ink-3">{u.email}</span></div>
          <Select className="!w-56" value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })}>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          <Btn onClick={() => { const p = prompt("New password (at least 8 characters):"); if (p) patch(u.id, { password: p }); }}>Reset password</Btn>
          <Btn kind={u.active ? "danger" : "soft"} onClick={() => patch(u.id, { active: !u.active })}>{u.active ? "Turn off" : "Turn on"}</Btn></div>))}</div>
      {nw && <Modal title="Add a person" onClose={() => setNw(null)}><div className="space-y-3.5">
        <Field label="Name"><Input value={nw.name} onChange={(e) => setNw({ ...nw, name: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={nw.email} onChange={(e) => setNw({ ...nw, email: e.target.value })} /></Field>
        <Field label="Starting password" hint="At least 8 characters. Tell them to keep it private."><Input value={nw.password} onChange={(e) => setNw({ ...nw, password: e.target.value })} /></Field>
        <Field label="Role"><Select value={nw.role} onChange={(e) => setNw({ ...nw, role: e.target.value })}>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
        <div className="flex justify-end gap-2"><Btn onClick={() => setNw(null)}>Cancel</Btn><Btn kind="primary" onClick={async () => { try { await api("/api/admin/users", "POST", nw); setNw(null); load(); toast("Person added."); } catch (e: any) { toast(e.message, true); } }}>Add</Btn></div></div></Modal>}
    </div>
  );
}

export function SettingsAdmin() {
  const [s, setS] = useState<Record<string, any> | null>(null);
  useEffect(() => { api("/api/admin/settings").then(setS).catch((e) => toast(e.message, true)); }, []);
  if (!s) return <p className="text-ink-3">Loading…</p>;
  const set = (k: string, v: any) => setS({ ...s, [k]: v });
  return (
    <div>
      <Head t="Site settings" s="Name, description and search-engine basics for the whole site."><Btn kind="primary" onClick={() => api("/api/admin/settings", "PUT", s).then(() => toast("Saved.")).catch((e) => toast(e.message, true))}>Save settings</Btn></Head>
      <div className="card max-w-2xl space-y-4 p-6">
        <Field label="Site name"><Input value={s.site_name || ""} onChange={(e) => set("site_name", e.target.value)} placeholder="Taptajivanam" /></Field>
        <Field label="Short description" hint="Shown in search results when a page has no description of its own."><Textarea value={s.site_description || ""} onChange={(e) => set("site_description", e.target.value)} /></Field>
        <Field label="Website address" hint="Used in the sitemap. For example https://taptajivanam.com"><Input value={s.site_url || ""} onChange={(e) => set("site_url", e.target.value)} placeholder="https://taptajivanam.com" /></Field>
        <Field label="Contact email"><Input value={s.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} /></Field>
      </div>
      <div className="card mt-6 max-w-2xl p-6">
        <p className="text-[15px] font-semibold text-ink">Home page · “Kṛṣṇa sent him”</p>
        <p className="mt-1 text-[13px] text-ink-3">Choose the design of the Śrīla Prabhupāda and Śrīla Gurudeva section. Preview each, then press Save settings.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BLESSINGS.map(([k, t, d]) => { const on = (s.home_blessing || "a") === k; return (
            <div key={k} role="button" tabIndex={0} onClick={() => set("home_blessing", k)} className={`cursor-pointer rounded-xl border p-4 transition ${on ? "border-ink ring-2 ring-ink/10" : "border-line hover:border-line-strong"}`}>
              <div className="flex items-center justify-between"><span className="text-[14px] font-semibold text-ink">{k.toUpperCase()} · {t}</span>{on && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">Chosen</span>}</div>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-3">{d}</p>
              <a href={`/home-new?blessing=${k}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 inline-block text-[12.5px] font-medium text-[#1a73e8] hover:underline">Preview ↗</a>
            </div>); })}
        </div>
      </div>
    </div>
  );
}
