"use client";
/* Studio building blocks, in the clean shadcn style: neutral greys, thin borders, small type, lucide icons. */
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";

export async function api<T = any>(url: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, { method, headers: body instanceof FormData ? undefined : { "content-type": "application/json" }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
  return j as T;
}
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Kind = "primary" | "ghost" | "danger" | "soft" | "outline" | "secondary";
const KIND: Record<Kind, string> = {
  primary: "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800",
  outline: "border border-zinc-200 bg-white shadow-xs hover:bg-zinc-100 text-zinc-900",
  ghost: "border border-zinc-200 bg-white shadow-xs hover:bg-zinc-100 text-zinc-900",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
  soft: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
  danger: "bg-red-600 text-white shadow-xs hover:bg-red-700",
};
export function Btn({ children, onClick, kind = "ghost", busy, disabled, type = "button", className = "", title, size = "md" }: { children: ReactNode; onClick?: () => void; kind?: Kind; busy?: boolean; disabled?: boolean; type?: "button" | "submit"; className?: string; title?: string; size?: "sm" | "md" | "icon" }) {
  const sz = size === "sm" ? "h-8 px-3 text-[13px] gap-1.5" : size === "icon" ? "h-9 w-9" : "h-9 px-4 text-[14px] gap-2";
  return <button type={type} title={title} onClick={onClick} disabled={disabled || busy} className={cn("inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-zinc-400/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", sz, KIND[kind], className)}>{busy && <Loader2 className="animate-spin" />}{children}</button>;
}
export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <label className={cn("grid gap-1.5", className)}><span className="text-[13px] font-medium leading-none text-zinc-900">{label}</span>{children}{hint && <span className="text-[12px] text-zinc-500">{hint}</span>}</label>;
}
export const inputCls = "h-9 w-full min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-1 text-[14px] text-zinc-900 shadow-xs outline-none transition placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-[3px] focus-visible:ring-zinc-400/30 disabled:opacity-50";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, "pr-8", p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(inputCls, "h-auto min-h-[84px] py-2 leading-relaxed", p.className)} />;
export const Badge = ({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" | "outline"; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium [&_svg]:size-3", { neutral: "bg-zinc-100 text-zinc-700", green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20", amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20", red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20", blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20", outline: "border border-zinc-200 text-zinc-700" }[tone], className)}>{children}</span>
);
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={cn("rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-xs", className)}>{children}</div>;
export function PageHeader({ title, description, children, icon: I }: { title: string; description?: string; children?: ReactNode; icon?: any }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="flex items-start gap-3">{I && <span className="mt-0.5 flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-xs"><I className="size-5 text-zinc-700" /></span>}<div><h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">{title}</h1>{description && <p className="mt-0.5 text-[14px] text-zinc-500">{description}</p>}</div></div>{children && <div className="flex flex-wrap items-center gap-2">{children}</div>}</div>;
}
export function Tabs({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: [string, ReactNode][] }) {
  return <div className="inline-flex h-9 items-center rounded-lg bg-zinc-100 p-[3px]">{items.map(([v, l]) => <button key={v} onClick={() => onChange(v)} className={cn("inline-flex h-full items-center gap-1.5 rounded-md px-3 text-[13.5px] font-medium transition [&_svg]:size-4", value === v ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-900")}>{l}</button>)}</div>;
}
export function Modal({ title, onClose, children, wide, description }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; description?: string }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn("relative w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-lg", wide ? "max-w-4xl" : "max-w-lg")}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-sm text-zinc-500 opacity-70 hover:opacity-100"><X className="size-4" /></button>
        <div className="mb-4 pr-6"><h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>{description && <p className="mt-1 text-[14px] text-zinc-500">{description}</p>}</div>
        {children}
      </div>
    </div>
  );
}
export function Sheet({ title, onClose, children, width = "max-w-xl", actions }: { title: ReactNode; onClose: () => void; children: ReactNode; width?: string; actions?: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={cn("flex h-full w-full flex-col border-l border-zinc-200 bg-white shadow-xl", width)}>
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 px-5"><div className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</div>{actions}<button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"><X className="size-4" /></button></div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
export const Empty = ({ icon: I, title, text, children }: { icon?: any; title: string; text?: string; children?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-6 py-14 text-center">{I && <span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-zinc-100"><I className="size-5 text-zinc-600" /></span>}<p className="font-medium">{title}</p>{text && <p className="mt-1 max-w-sm text-[13.5px] text-zinc-500">{text}</p>}{children && <div className="mt-4">{children}</div>}</div>
);

let pushToast: (m: string, bad?: boolean) => void = () => {};
export const toast = (m: string, bad = false) => pushToast(m, bad);
export function Toaster() {
  const [t, setT] = useState<{ m: string; bad: boolean; k: number } | null>(null);
  useEffect(() => { pushToast = (m, bad = false) => { const k = Date.now(); setT({ m, bad, k }); setTimeout(() => setT((x) => (x?.k === k ? null : x)), 3600); }; }, []);
  return t ? <div className="fixed bottom-5 right-5 z-[130] flex max-w-sm items-start gap-2.5 rounded-lg border border-zinc-200 bg-white p-4 text-[14px] shadow-lg">{t.bad ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}<span className="text-zinc-900">{t.m}</span></div> : null;
}
