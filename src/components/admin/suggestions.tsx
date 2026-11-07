"use client";
/* Studio → Suggestions: suggestions and information sent by visitors from the lecture pages. */
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "./ui";
import { Check, X, Trash2, ExternalLink, MessageSquareText } from "lucide-react";
import { Btn, Badge, Card, PageHeader, Tabs, Empty, api, toast } from "./ui";

type Row = { id: string; item_slug: string | null; item_title: string | null; about: string; quote: string | null; text: string; name: string | null; email: string | null; status: string; created_at: string; reply: string | null; applied: boolean };
const ABOUT: Record<string, string> = { transcript: "About the transcription", info: "Information about the recording", other: "Something else" };

export function Suggestions() {
  const [st, setSt] = useState("new"); const [d, setD] = useState<{ rows: Row[]; counts: { status: string; n: number }[] } | null>(null);
  const load = useCallback(() => api<any>(`/api/admin/suggestions?status=${st}`).then(setD).catch((e) => toast(e.message, true)), [st]);
  useEffect(() => { load(); }, [load]);
  const n = (s: string) => d?.counts.find((c) => c.status === s)?.n || 0;
  const ping = () => window.dispatchEvent(new Event("tj:suggestions"));
  const set = (id: string, status: string) => api("/api/admin/suggestions", "POST", { id, status }).then(() => { load(); ping(); });
  return (
    <div>
      <PageHeader icon={MessageSquareText} title="Suggestions" description="Suggestions about transcriptions and information about recordings, sent by visitors. Make any change in the recording, then mark it done." />
      <Tabs value={st} onChange={setSt} items={[["new", `New (${n("new")})`], ["done", `Done (${n("done")})`], ["declined", `Declined (${n("declined")})`], ["all", "All"]]} />
      <div className="mt-4 space-y-3">
        {!d ? null : !d.rows.length ? <Empty icon={MessageSquareText} title="Nothing here" text="Suggestions from visitors appear here." /> : d.rows.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold">{r.item_title || r.item_slug || "General"}</p>
                <p className="text-[12px] text-zinc-500">{ABOUT[r.about] || r.about} · {new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}{r.name ? ` · ${r.name}` : ""}{r.email ? ` · ${r.email}` : ""}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge tone="outline">{r.status}</Badge>
                {r.item_slug && <a href={`/teachings/audio/${r.item_slug}`} target="_blank" className="flex items-center gap-1 rounded px-2 py-1 text-[12px] text-zinc-500 hover:bg-zinc-100"><ExternalLink className="size-3.5" />Open</a>}
              </div>
            </div>
            <One r={r} onDone={() => { load(); ping(); }} />
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== "done" && <Btn size="sm" onClick={() => set(r.id, "done")}><Check />Mark done</Btn>}
              {r.status !== "declined" && <Btn size="sm" onClick={() => set(r.id, "declined")}><X />Decline</Btn>}
              {r.status !== "new" && <Btn size="sm" onClick={() => set(r.id, "new")}>Back to new</Btn>}
              <Btn size="sm" onClick={() => confirm("Delete this suggestion?") && api("/api/admin/suggestions", "DELETE", { id: r.id }).then(() => { load(); ping(); })}><Trash2 />Delete</Btn>
            </div>
          </Card>))}
      </div>
    </div>
  );
}

/** One suggestion: the passage and the suggestion (editable before accepting), Accept to change the transcription at once, and a reply. */
function One({ r, onDone }: { r: Row; onDone: () => void }) {
  const [text, setText] = useState(r.text); const [reply, setReply] = useState(r.reply || ""); const [busy, setBusy] = useState("");
  const accept = async () => { setBusy("a"); try { const j = await api<{ href: string }>("/api/admin/suggestions", "POST", { accept: r.id, text }); toast("Accepted — the transcription is changed on the website."); onDone(); window.open(j.href, "_blank"); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  const save = async () => { setBusy("r"); try { await api("/api/admin/suggestions", "POST", { reply: r.id, text: reply }); toast("Reply saved."); onDone(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  const canApply = r.about === "transcript" && !!r.quote && !r.applied;
  return (
    <div className="mt-3 space-y-3">
      {r.quote && <div><p className="mb-1 text-[11.5px] font-medium text-zinc-500">The passage</p><blockquote className="rounded-md border-l-2 border-zinc-300 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-600">{r.quote}</blockquote></div>}
      <div><p className="mb-1 text-[11.5px] font-medium text-zinc-500">{canApply ? "Suggested text — you can adjust it before accepting" : "Suggestion"}</p>
        {canApply ? <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} className="text-[13.5px]" /> : <p className="whitespace-pre-line text-[13.5px]">{r.text}</p>}</div>
      {r.applied && <Badge>Applied to the transcription</Badge>}
      {canApply && <Btn kind="primary" size="sm" busy={busy === "a"} onClick={accept}><Check />Accept — change the transcription</Btn>}
      <div><p className="mb-1 text-[11.5px] font-medium text-zinc-500">Reply</p>
        <div className="flex flex-col gap-2 sm:flex-row"><Textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="flex-1 text-[13px]" />
          <div className="flex gap-2 sm:flex-col"><Btn size="sm" busy={busy === "r"} disabled={!reply.trim()} onClick={save}>Save reply</Btn>{r.email && reply.trim() && <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your suggestion — ${r.item_title || "Taptajīvanam"}`)}&body=${encodeURIComponent(reply)}`} className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 px-3 text-[12.5px] hover:bg-zinc-50">Send by email</a>}</div></div>
      </div>
    </div>
  );
}
