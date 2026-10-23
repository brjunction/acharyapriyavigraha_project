"use client";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./motifs";

/** Image with a graceful fallback (used for photos served from taptajivanam.com). */
export function Img({ src, alt, className = "", fallback = "mark" }: { src: string; alt: string; className?: string; fallback?: string }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before hydration never fires onError, so check once mounted.
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setErr(true); }, [src]);
  if (err) {
    if (!fallback) return null;
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-saffron-soft to-band text-saffron/40 ${className}`} role="img" aria-label={alt}>
        <LogoMark className="h-1/3 max-h-24 w-1/3 max-w-24" flame="currentColor" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setErr(true)} loading="lazy" decoding="async" />;
}
