/* The Studio's AI helper: one call for Gemini, OpenAI or Claude, with the key kept on the server only (settings 'ai').
   Its tasks keep Śrīla Gurudeva's words exactly; they only tidy, structure and spell. */
import { sql } from "@/lib/db";

export type AiProvider = "gemini" | "openai" | "anthropic";
export type AiConfig = { provider: AiProvider; model: string; key: string };
export const DEFAULT_MODEL: Record<AiProvider, string> = { gemini: "gemini-2.5-pro", openai: "gpt-4.1", anthropic: "claude-sonnet-4-5" };

export async function aiConfig(): Promise<AiConfig | null> {
  try {
    const v = ((await sql`select value from settings where key = 'ai'`)[0] as any)?.value || {};
    const provider = (["gemini", "openai", "anthropic"].includes(v.provider) ? v.provider : "gemini") as AiProvider;
    const key = v.key || (provider === "gemini" ? process.env.GEMINI_API_KEY : provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY) || "";
    return key ? { provider, model: v.model || DEFAULT_MODEL[provider], key } : null;
  } catch { return null; }
}

/** Ask the chosen AI. Returns its text. */
export async function askAI(cfg: AiConfig, system: string, prompt: string, maxTokens = 32000): Promise<string> {
  const signal = AbortSignal.timeout(280000);
  if (cfg.provider === "gemini") {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`, { method: "POST", signal, headers: { "content-type": "application/json", "x-goog-api-key": cfg.key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: Math.min(maxTokens, 65000) } }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(`Gemini: ${j?.error?.message || r.statusText}`);
    const text = (j.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("");
    if (!text) throw new Error(`Gemini returned nothing${j.candidates?.[0]?.finishReason ? ` (${j.candidates[0].finishReason})` : ""}.`);
    return text;
  }
  if (cfg.provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", signal, headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify({ model: cfg.model, temperature: 0.2, max_tokens: Math.min(maxTokens, 32000), messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(`OpenAI: ${j?.error?.message || r.statusText}`);
    return j.choices?.[0]?.message?.content || "";
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal, headers: { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: cfg.model, max_tokens: Math.min(maxTokens, 32000), temperature: 0.2, system, messages: [{ role: "user", content: prompt }] }) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(`Claude: ${j?.error?.message || r.statusText}`);
  return (j.content || []).map((c: any) => c.text || "").join("");
}

const RULES = `You are helping the editors of Taptajīvanam, the archive of the lectures and writings of Śrī Śrīmad Gour Govinda Swāmī (called Śrīla Gurudeva).
Absolute rules:
- Never add, remove, reorder or reword what the speaker said. Never invent words, sentences, verses or meaning. Keep his expressions and repetitions.
- When unsure about a word, keep it as it is and mark it like this: [?word?].
- Use standard IAST spelling with diacritics for Sanskrit, Bengali and Oriya terms and names (Kṛṣṇa, Śrīmad-Bhāgavatam, Mahāprabhu, Gauḍīya, prema, bhakti…) and standard verse references (SB 1.2.6, BG 18.66, CC Madhya 15.104).
- Answer only with the text in Markdown (headings with ##, paragraphs separated by a blank line, verses as > quotes, **bold** only for speaker names). No introductions, notes or explanations.`;

export const TASKS: Record<string, { label: string; hint: string; system: string }> = {
  structure: { label: "Structure the transcription", hint: "Paragraphs, headings for the parts of the lecture, verses set apart, speakers in questions and answers. Words unchanged.",
    system: `${RULES}\nTask: give the transcription a clear structure. Break it into readable paragraphs. Add short ## headings at the natural parts of the lecture (headings are your own short titles, the only words you may add). Put quoted verses (Sanskrit and their translations) on their own lines as > quotes. In questions and answers, start each turn with the speaker in bold (**Devotee:**, **Śrīla Gurudeva:**). Fix only obvious punctuation. Every spoken word stays.` },
  proofread: { label: "Proofread", hint: "Spelling, punctuation, capitals and diacritics only — the wording stays the same.",
    system: `${RULES}\nTask: proofread. Correct spelling, punctuation, capital letters and the diacritics of Sanskrit terms and names. Do not change the wording, grammar or style of the speaker, and do not shorten anything. Keep the existing structure and headings.` },
  diacritics: { label: "Diacritics only", hint: "Sanskrit terms and names in correct IAST — nothing else changes.",
    system: `${RULES}\nTask: correct only the spelling of Sanskrit, Bengali and Oriya terms and names to standard IAST with diacritics, and verse references to the standard form. Change nothing else at all.` },
  headings: { label: "Add headings only", hint: "Short headings at the parts of the lecture; the text itself untouched.",
    system: `${RULES}\nTask: add short ## headings at the natural parts of the lecture. Do not change any of the text itself or the paragraphs.` },
  summary: { label: "Write a summary", hint: "Two or three sentences for the lecture’s summary field, from the text only.",
    system: `You summarise lectures of Śrī Śrīmad Gour Govinda Swāmī (Śrīla Gurudeva) for an archive. Write two or three plain sentences describing what the lecture is about, in the third person ("Śrīla Gurudeva explains…"). Use only what is in the text; never invent quotes or facts. IAST diacritics. Answer with the summary only.` },
  custom: { label: "Your own instruction", hint: "Tell it what to do; the same rules about his words always apply.", system: `${RULES}\nTask: follow the editor's instruction below, within the rules above.` },
};
