import { guard, json, fail } from "@/lib/api";
import { aiConfig } from "@/lib/ai";

/* Studio → Create an image. Uses the Gemini key kept on the server (settings 'ai', or GEMINI_API_KEY); the key never
   reaches the browser. Returns the pictures as data; the editor chooses which to save to Pictures & files. */
export const maxDuration = 120;
const ASPECTS = ["1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16", "21:9"];
const MODELS = ["gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"];

export async function POST(req: Request) {
  const g = await guard("editor"); if ("res" in g) return g.res;
  const b = await req.json().catch(() => ({}));
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : "";
  if (prompt.length < 3) return fail("Describe the picture first.");
  if (prompt.length > 4000) return fail("The description is too long (4,000 characters at most).");
  const aspect = ASPECTS.includes(b.aspect) ? b.aspect : "1:1";
  const n = Math.min(4, Math.max(1, Number(b.n) || 1));
  const cfg = await aiConfig();
  const key = cfg?.provider === "gemini" ? cfg.key : process.env.GEMINI_API_KEY || "";
  if (!key) return fail("No Gemini key is saved. Add it in Studio → Settings → AI (Gemini).");

  const one = async (model: string) => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: AbortSignal.timeout(110000), headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } } }),
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) { const e: any = new Error(j?.error?.message || r.statusText); e.status = r.status; throw e; }
    const part = (j.candidates?.[0]?.content?.parts || []).find((p: any) => p.inlineData?.data);
    if (!part) throw new Error(j.candidates?.[0]?.finishReason === "SAFETY" || j.promptFeedback?.blockReason ? "Gemini declined this description. Try describing it differently." : "Gemini returned no picture. Try again.");
    return { type: part.inlineData.mimeType || "image/png", base64: part.inlineData.data as string };
  };
  const make = async () => { let last: any; for (const m of MODELS) { try { return await one(m); } catch (e: any) { last = e; if (e.status !== 404) break; } } throw last; };

  try {
    const out = await Promise.all(Array.from({ length: n }, make));
    return json({ images: out });
  } catch (e: any) { return fail(`Gemini: ${e.message || "the picture could not be made."}`); }
}
