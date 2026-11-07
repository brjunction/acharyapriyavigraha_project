import { sql } from "@/lib/db";
import { guard, json, fail } from "@/lib/api";
import { aiConfig, askAI, TASKS, DEFAULT_MODEL, type AiProvider } from "@/lib/ai";

export const maxDuration = 300;
/** Which AI is set (never the key itself). */
export async function GET() {
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const v = (((await sql`select value from settings where key = 'ai'`)[0] as any)?.value || {}) as any; const c = await aiConfig();
  return json({ provider: v.provider || "gemini", model: v.model || "", ready: !!c, keyEnd: v.key ? String(v.key).slice(-4) : null, tasks: Object.entries(TASKS).map(([k, t]) => ({ key: k, label: t.label, hint: t.hint })), defaults: DEFAULT_MODEL });
}
/** { config: { provider, model, key? } } (admins) · { test: true } · { task, text, instruction? } */
export async function POST(req: Request) {
  const b = await req.json();
  if (b.config) {
    const g = await guard("admin"); if ("res" in g) return g.res;
    const cur = (((await sql`select value from settings where key = 'ai'`)[0] as any)?.value || {}) as any;
    const provider: AiProvider = ["gemini", "openai", "anthropic"].includes(b.config.provider) ? b.config.provider : "gemini";
    const v = { provider, model: String(b.config.model || "").trim(), key: b.config.key === "" ? "" : String(b.config.key || cur.key || "").trim() };
    await sql`insert into settings (key, value) values ('ai', ${JSON.stringify(v)}::jsonb) on conflict (key) do update set value = excluded.value`;
    return json({ ok: true });
  }
  const g = await guard("contributor"); if ("res" in g) return g.res;
  const cfg = await aiConfig(); if (!cfg) return fail("No AI key yet. An admin can add one in Studio → Settings → AI assistant.");
  try {
    if (b.test) { const t = await askAI(cfg, "Answer in one short line.", "Say: ready", 50); return json({ ok: true, answer: t.trim().slice(0, 100) }); }
    const t = TASKS[b.task]; if (!t) return fail("Choose what the AI should do.");
    const text = String(b.text || ""); if (!text.trim()) return fail("There is no text to work on.");
    if (text.length > 400000) return fail("This text is very long — select a part of it and work on that.");
    const prompt = `${b.instruction ? `Instruction from the editor: ${String(b.instruction).slice(0, 2000)}\n\n` : ""}${b.context ? `About this recording: ${String(b.context).slice(0, 800)}\n\n` : ""}Text:\n\n${text}`;
    const out = (await askAI(cfg, t.system, prompt, b.task === "summary" ? 1200 : 60000)).replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/, "").trim();
    return json({ text: out, provider: cfg.provider, model: cfg.model });
  } catch (e: any) { return fail(e?.name === "TimeoutError" ? "The AI took too long. Try a smaller part of the text." : e.message || "The AI could not answer."); }
}
