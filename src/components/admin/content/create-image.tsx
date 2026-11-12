"use client";
/* Studio → Create an image (Gemini). Describe a picture, choose its shape, make up to four, save the ones you like to
   Pictures & files. Ready descriptions are for decorations, backgrounds and covers; pictures of Śrīla Gurudeva or other
   real people are never made here: real photographs only. */
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Download, Save, ArrowLeft, Loader2 } from "lucide-react";
import { Btn, Card, Field, Select, Textarea, PageHeader, api, toast } from "../ui";

const READY: [string, string][] = [
  ["Lotus border", "An elegant ornamental border of lotus flowers and leaves, fine gold line art on a warm ivory background, symmetrical, generous empty space in the centre for text, flat vector style, no text, no watermark."],
  ["Temple at dawn", "A serene Odishan temple silhouette at dawn, soft saffron and rose sky, gentle mist, painted in calm watercolour, wide composition with open sky at the top for a title, no people, no text, no watermark."],
  ["Book cover background", "An abstract, calm book-cover background: deep maroon with a subtle pattern of small gold lotus motifs, soft light from the top, plenty of empty space for a title, no text, no watermark."],
  ["Tulasī leaves pattern", "A seamless pattern of tulasī leaves and small purple mañjarī flowers on a pale cream background, delicate botanical illustration, soft colours, no text, no watermark."],
  ["Festival banner", "A wide festival banner background with marigold garlands hanging across the top, warm saffron and gold tones, soft bokeh lights, empty centre for text, photorealistic, no people, no text, no watermark."],
  ["Holy river", "The holy river at sunrise seen from stone steps, brass lamps floating on the water, golden light, peaceful and quiet, photorealistic, wide landscape, no people, no text, no watermark."],
];
const ASPECTS: [string, string][] = [["1:1", "Square"], ["3:2", "Landscape 3:2"], ["16:9", "Wide 16:9"], ["21:9", "Banner 21:9"], ["2:3", "Portrait 2:3"], ["3:4", "Book cover 3:4"], ["9:16", "Phone 9:16"]];

type Img = { type: string; base64: string; saved?: string };

/** Pictures over 3.5 MB are re-encoded as WebP in the browser, so they fit Pictures & files. */
async function toBlob(img: Img): Promise<Blob> {
  const raw = await (await fetch(`data:${img.type};base64,${img.base64}`)).blob();
  if (raw.size <= 3_500_000) return raw;
  const bmp = await createImageBitmap(raw); const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height; c.getContext("2d")!.drawImage(bmp, 0, 0);
  return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), "image/webp", 0.88));
}

export function CreateImage() {
  const [prompt, setPrompt] = useState(""); const [aspect, setAspect] = useState("16:9"); const [n, setN] = useState(2);
  const [busy, setBusy] = useState(false); const [imgs, setImgs] = useState<Img[]>([]);
  const make = async () => {
    setBusy(true);
    try { const r = await api<{ images: Img[] }>("/api/admin/images/create", "POST", { prompt, aspect, n }); setImgs((x) => [...r.images, ...x]); }
    catch (e: any) { toast(e.message, true); } finally { setBusy(false); }
  };
  const save = async (k: number) => {
    const img = imgs[k]; const blob = await toBlob(img); const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
    const name = `${(prompt.split(/[,.]/)[0] || "picture").trim().slice(0, 50).replace(/[^\p{L}\p{N} -]+/gu, "") || "picture"}.${ext}`;
    const fd = new FormData(); fd.append("file", new File([blob], name, { type: blob.type }));
    try { const r = await api<{ url: string }>("/api/admin/media", "POST", fd); setImgs((x) => x.map((y, i) => (i === k ? { ...y, saved: r.url } : y))); toast("Saved to Pictures & files."); }
    catch (e: any) { toast(e.message, true); }
  };
  return (
    <div>
      <PageHeader icon={Sparkles} title="Create an image" description="Describe a picture and Gemini paints it. Save the ones you like to Pictures & files, then use them on any page.">
        <Link href="/admin/media" className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-[13px] hover:bg-zinc-50"><ArrowLeft className="size-4" />Pictures & files</Link>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Card className="space-y-4 self-start p-4">
          <Field label="Describe the picture" hint="Say what is in it, the style (photo, watercolour, line art), the light and colours, and where to leave space for text. Real people are not drawn here — use real photographs for them.">
            <Textarea rows={7} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A calm watercolour of a lotus pond at dawn, soft saffron light, empty sky at the top for a title, no text…" />
          </Field>
          <div>
            <p className="mb-1.5 text-[12.5px] font-medium">Ready descriptions</p>
            <div className="flex flex-wrap gap-1.5">{READY.map(([l, p]) => <button key={l} onClick={() => setPrompt(p)} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[12px] text-zinc-700 hover:border-zinc-400">{l}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shape"><Select value={aspect} onChange={(e) => setAspect(e.target.value)}>{ASPECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
            <Field label="How many"><Select value={n} onChange={(e) => setN(Number(e.target.value))}>{[1, 2, 3, 4].map((x) => <option key={x} value={x}>{x}</option>)}</Select></Field>
          </div>
          <Btn kind="primary" className="w-full" busy={busy} disabled={prompt.trim().length < 3} onClick={make}><Sparkles />{busy ? "Painting…" : "Create"}</Btn>
        </Card>
        <div>
          {!imgs.length && !busy && <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-zinc-300 text-[13px] text-zinc-500">The pictures appear here.</div>}
          {busy && !imgs.length && <div className="flex aspect-[16/9] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-500"><Loader2 className="size-4 animate-spin" />Painting… this takes up to a minute.</div>}
          <div className="grid gap-4 sm:grid-cols-2">{imgs.map((m, k) => (
            <figure key={k} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:${m.type};base64,${m.base64}`} alt="" className="h-auto w-full bg-zinc-50" />
              <figcaption className="flex items-center gap-2 p-2">
                {m.saved ? <span className="mr-auto text-[12.5px] text-emerald-700">Saved · <button className="underline" onClick={() => { navigator.clipboard.writeText(m.saved!); toast("Address copied."); }}>copy address</button></span> : <span className="mr-auto" />}
                <a href={`data:${m.type};base64,${m.base64}`} download={`picture-${k + 1}.${m.type.split("/")[1] || "png"}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-[12.5px] hover:bg-zinc-50"><Download className="size-4" />Download</a>
                {!m.saved && <Btn size="sm" kind="primary" onClick={() => save(k)}><Save />Save to Pictures</Btn>}
              </figcaption>
            </figure>))}</div>
        </div>
      </div>
    </div>);
}
