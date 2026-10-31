"use client";
import { useEffect, useRef, useState } from "react";

/** Gurudeva's signature image, with a quiet written fallback if the image is unavailable. */
export function Signature({ src, className = "" }: { src: string; className?: string }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setErr(true); }, []);
  if (err) return <span className="text-[24px]  tracking-wide text-white/90">Gour Govinda Swāmī Gurudeva</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt="Signature of Śrī Śrīmad Gour Govinda Swāmī Gurudeva" onError={() => setErr(true)} className={className} />;
}
