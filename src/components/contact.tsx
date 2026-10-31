"use client";
/* Contact: how to reach Taptajīvanam — write, call, WhatsApp, visit, follow. */
import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Youtube, Instagram, Facebook, Send, Copy, Check, ArrowRight, PencilLine, HandHeart, Newspaper, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/data";

const WA = "https://chat.whatsapp.com/I8oPWbXQt9c7mTpken8eF6";
const tel = SITE.phone.replace(/\s/g, "");
const TOPICS = ["A question", "A correction on the website", "Sending recordings, photos or texts", "Offering service", "Gopāl Jiu magazine", "Something else"];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button onClick={(e) => { e.preventDefault(); navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }} title="Copy" className="flex size-8 items-center justify-center rounded-full text-ink-3 transition hover:bg-band hover:text-ink">{ok ? <Check size={15} className="text-[#137333]" /> : <Copy size={15} />}</button>;
}

export function Contact() {
  const [f, setF] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const send = (e: React.FormEvent) => { e.preventDefault(); const body = `${f.message}\n\n— ${f.name}${f.email ? ` (${f.email})` : ""}`; location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`${f.topic} — Taptajīvanam website`)}&body=${encodeURIComponent(body)}`; };
  const cards: [any, string, string, string, string, string][] = [
    [Mail, "Email", SITE.email, `mailto:${SITE.email}`, "We reply within a few days", "#1a73e8"],
    [Phone, "Phone", SITE.phone, `tel:${tel}`, "India · call or SMS", "#137333"],
    [MessageCircle, "WhatsApp", "Daily offering group", WA, "Śrīla Gurudeva’s words every day", "#128c7e"],
  ];
  const field = "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none transition placeholder:text-ink-3 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/15";
  return (
    <div className="bg-white">
      <section className="border-b border-line bg-gradient-to-b from-[#f6f8fc] to-white">
        <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">Contact</p>
          <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[40px]">We would be glad to hear from you</h1>
          <p className="mt-3 max-w-[600px] text-[15.5px] leading-relaxed text-ink-2">Questions, corrections, recordings to share, or an offer of service — write, call or message Taptajīvanam.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {cards.map(([I, t, v, href, d, c]) => (
              <a key={t} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,.35)]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${c}17`, color: c }}><I size={20} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[12.5px] font-medium text-ink-3">{t}</span><span className="block truncate text-[15px] font-semibold text-ink">{v}</span><span className="mt-0.5 block text-[12.5px] text-ink-3">{d}</span></span>
                {t !== "WhatsApp" ? <CopyBtn text={v} /> : <ExternalLink size={15} className="mt-1 text-ink-3" />}
              </a>))}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">Send a message</h2>
          <p className="mt-1 text-[13.5px] text-ink-3">It opens in your email app, ready to send.</p>
          <form onSubmit={send} className="mt-5 space-y-4 rounded-2xl border border-line p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Your name</span><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} placeholder="Name" /></label>
              <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Your email</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} placeholder="you@example.com" /></label>
            </div>
            <div><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">About</span><div className="flex flex-wrap gap-1.5">{TOPICS.map((t) => <button type="button" key={t} onClick={() => setF({ ...f, topic: t })} className={`h-8 rounded-full border px-3 text-[12.5px] font-medium transition ${f.topic === t ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1765cc]" : "border-line-strong text-ink-2 hover:border-ink-3"}`}>{t}</button>)}</div></div>
            <label className="block"><span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Message</span><textarea required rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className={`${field} h-auto py-3 leading-relaxed`} placeholder="Write your message…" /></label>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1a73e8] px-6 text-[14px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(26,115,232,.6)] transition hover:-translate-y-0.5 hover:bg-[#1765cc]"><Send size={16} />Send message</button>
          </form>
        </section>

        <section>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">Visit</h2>
          <p className="mt-1 text-[13.5px] text-ink-3">Temples and places connected with Taptajīvanam.</p>
          <div className="mt-5 space-y-3">
            {SITE.locations.map((l) => (
              <a key={l.name} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([l.name, ...l.lines.slice(1)].join(", "))}`} target="_blank" rel="noreferrer" className="group flex items-start gap-3.5 rounded-2xl border border-line p-4 transition hover:border-line-strong hover:bg-band/50">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fdecea] text-[#b3261e]"><MapPin size={18} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold text-ink">{l.name}</span>{l.lines.map((x) => <span key={x} className="block text-[13px] leading-snug text-ink-2">{x}</span>)}</span>
                <span className="mt-0.5 text-[12px] font-medium text-[#1a73e8] opacity-0 transition group-hover:opacity-100">Map ↗</span>
              </a>))}
          </div>
          <h3 className="mt-9 text-[15px] font-semibold text-ink">Follow</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {[[Youtube, "YouTube", SITE.youtube, "#ff0000"], [Instagram, "Instagram", "https://www.instagram.com/taptajivanam", "#d6249f"], [Facebook, "Facebook", "https://www.facebook.com/tapta.jivanam", "#1877f2"], [MessageCircle, "WhatsApp", WA, "#25d366"]].map(([I, t, h, c]: any) => <a key={t} href={h} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[13px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ink-3"><I size={16} style={{ color: c }} />{t}</a>)}
          </div>
        </section>
      </div>

      <section className="border-t border-line bg-[#f8f9fa]">
        <div className="mx-auto grid max-w-[1120px] gap-3 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {[[PencilLine, "Suggest a correction", "Found a mistake in a text, a date or a name?", "/about/suggest-correction"], [HandHeart, "Support the archive", "Sevā, sponsorship and contributions", "/about/support"], [Newspaper, "Gopāl Jiu magazine", "Receive the magazine", "/about/subscribe"]].map(([I, t, d, h]: any) => (
            <Link key={t} href={h} className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(0,0,0,.35)]"><span className="flex size-10 items-center justify-center rounded-xl bg-band text-ink-2"><I size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-ink">{t}</span><span className="block text-[12.5px] text-ink-3">{d}</span></span><ArrowRight size={16} className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink" /></Link>))}
        </div>
      </section>
    </div>
  );
}
