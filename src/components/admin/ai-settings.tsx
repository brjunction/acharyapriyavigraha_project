"use client";
/* Studio → Settings → AI assistant: which AI to use and its key. The key stays on the server; only its last four characters are shown. */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Btn, Field, Input, Select, api, toast } from "./ui";

export function AiSettings() {
  const [d, setD] = useState<any>(null); const [provider, setProvider] = useState("gemini"); const [model, setModel] = useState(""); const [key, setKey] = useState(""); const [busy, setBusy] = useState("");
  const load = () => api<any>("/api/admin/ai").then((r) => { setD(r); setProvider(r.provider); setModel(r.model); }).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => { setBusy("s"); try { await api("/api/admin/ai", "POST", { config: { provider, model, ...(key ? { key } : {}) } }); setKey(""); toast("AI settings saved."); load(); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  const test = async () => { setBusy("t"); try { const r = await api<{ answer: string }>("/api/admin/ai", "POST", { test: true }); toast(`It works — the AI answered: “${r.answer}”`); } catch (e: any) { toast(e.message, true); } finally { setBusy(""); } };
  return (
    <div className="card mt-6 max-w-2xl p-6">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Sparkles className="size-4 text-[#7c4dff]" />AI assistant</p>
      <p className="mt-1 text-[13px] text-ink-3">Used in the Studio to structure and proofread transcriptions and writings. It never changes Śrīla Gurudeva’s words — it only tidies, spells and arranges, and every change is shown to you before it is used.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Which AI"><Select value={provider} onChange={(e) => { setProvider(e.target.value); setModel(""); }}><option value="gemini">Google Gemini</option><option value="openai">OpenAI (ChatGPT)</option><option value="anthropic">Anthropic Claude</option></Select></Field>
        <Field label="Model" hint={`Leave empty for ${d?.defaults?.[provider] || "the default"}.`}><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder={d?.defaults?.[provider] || ""} /></Field>
      </div>
      <Field label="API key" hint={provider === "gemini" ? "From aistudio.google.com → Get API key. A Gemini Pro subscription in the app is separate; the website needs an API key." : provider === "openai" ? "From platform.openai.com → API keys." : "From console.anthropic.com → API keys."}>
        <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={d?.keyEnd ? `•••• ${d.keyEnd} (saved — paste a new one to change it)` : "Paste the key"} autoComplete="off" />
      </Field>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Btn kind="primary" busy={busy === "s"} onClick={save}>Save AI settings</Btn>
        <Btn busy={busy === "t"} disabled={!d?.ready} onClick={test}>Test</Btn>
        {d?.keyEnd && <Btn onClick={() => confirm("Remove the saved key?") && api("/api/admin/ai", "POST", { config: { provider, model, key: "" } }).then(load)}>Remove key</Btn>}
        <span className={`text-[12.5px] ${d?.ready ? "text-emerald-700" : "text-ink-3"}`}>{d?.ready ? "Ready" : "Not set up yet"}</span>
      </div>
    </div>
  );
}
