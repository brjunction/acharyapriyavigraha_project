"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";

export async function api<T = any>(url: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, { method, headers: body instanceof FormData ? undefined : { "content-type": "application/json" }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
  return j as T;
}

export function Btn({ children, onClick, kind = "ghost", busy, disabled, type = "button", className = "", title }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "ghost" | "danger" | "soft"; busy?: boolean; disabled?: boolean; type?: "button" | "submit"; className?: string; title?: string }) {
  const k = kind === "primary" ? "bg-saffron text-white hover:brightness-110 shadow-[0_8px_18px_-10px_rgba(133,53,0,.7)]" : kind === "danger" ? "border border-[#e6b9b4] text-[#a3281e] hover:bg-[#fdeceb]" : kind === "soft" ? "bg-saffron-soft text-saffron hover:brightness-95" : "border border-line-strong text-ink-2 hover:bg-band";
  return <button type={type} title={title} onClick={onClick} disabled={disabled || busy} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium transition disabled:opacity-50 ${k} ${className}`}>{busy && <Loader2 size={15} className="animate-spin" />}{children}</button>;
}
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[12.5px] font-semibold text-ink-2">{label}</span>{children}{hint && <span className="mt-1 block text-[12px] text-ink-3">{hint}</span>}</label>;
}
export const inputCls = "h-10 w-full rounded-xl border border-line-strong bg-white px-3 text-[14px] text-ink outline-none transition focus:border-saffron focus:ring-4 focus:ring-[color-mix(in_srgb,var(--saffron)_14%,transparent)]";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className || ""}`} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${inputCls} ${p.className || ""}`} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`${inputCls} h-auto min-h-[90px] py-2.5 leading-relaxed ${p.className || ""}`} />;

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#2a1a0e]/45 p-4 backdrop-blur-sm sm:p-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-4xl" : "max-w-lg"} rounded-3xl border border-line bg-surface p-5 shadow-[0_40px_90px_-30px_rgba(40,20,5,.6)] sm:p-7`}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-[19px] font-bold tracking-[-0.02em]">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-ink-3 hover:bg-band"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

let pushToast: (m: string, bad?: boolean) => void = () => {};
export const toast = (m: string, bad = false) => pushToast(m, bad);
export function Toaster() {
  const [t, setT] = useState<{ m: string; bad: boolean } | null>(null);
  useEffect(() => { pushToast = (m, bad = false) => { setT({ m, bad }); setTimeout(() => setT(null), 3200); }; }, []);
  return t ? <div className={`fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white shadow-xl ${t.bad ? "bg-[#a3281e]" : "bg-[#2f6b3f]"}`}>{t.m}</div> : null;
}
