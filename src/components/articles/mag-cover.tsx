import { Newspaper } from "lucide-react";
/** A magazine or issue cover, or a quiet placeholder with its name. */
export function MagCover({ src, label, className = "" }: { src?: string | null; label: string; className?: string }) {
  return (
    <span className={`relative block aspect-[3/4] overflow-hidden rounded-[2px_5px_5px_2px] bg-band shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_24px_-14px_rgba(0,0,0,0.35)] ${className}`}>
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={label} loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#f4efe6] to-[#e7dccb] p-3 text-center text-ink-2"><Newspaper size={18} className="text-ink-3" /><span className="text-[12px] font-medium leading-snug">{label}</span></span>}
    </span>
  );
}

/** A magazine's face: its own cover, or — when it has none — its latest issue covers laid one over another. */
export function MagStack({ cover, issues, label, className = "" }: { cover?: string | null; issues: (string | null | undefined)[]; label: string; className?: string }) {
  const pics = issues.filter(Boolean).slice(0, 3) as string[];
  if (cover || pics.length < 2) return <MagCover src={cover || pics[0]} label={label} className={className} />;
  return (
    <span className={`relative block aspect-[3/4] ${className}`}>
      {pics.slice().reverse().map((p, k, a) => { const d = a.length - 1 - k; return (
        <span key={p} className="absolute inset-0 overflow-hidden rounded-[2px_5px_5px_2px] bg-band shadow-[0_1px_2px_rgba(0,0,0,0.1),0_10px_22px_-12px_rgba(0,0,0,0.4)] transition duration-300" style={{ transform: `translate(${d * 7}%, ${-d * 3}%) rotate(${d * 3.5}deg) scale(${1 - d * 0.06})`, transformOrigin: "bottom left", zIndex: 3 - d }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={p} alt={d === 0 ? label : ""} loading="lazy" className="h-full w-full object-cover" />
        </span>); })}
    </span>);
}
