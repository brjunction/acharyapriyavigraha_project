/* A round portrait, or the first letter of the name on a soft saffron ground when there is no picture yet. */
export function Portrait({ src, name, size = 56, ring }: { src?: string | null; name: string; size?: number; ring?: boolean }) {
  if (!src) return null;   // no letter-badges: a portrait only where a real photo has been added
  const letter = name.replace(/^(Śrī Śrīmad|Śrīla|Śrīpāda|Śrī|Om Viṣṇupāda)\s+/i, "").trim().charAt(0) || "•";
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#fbe9cf] to-[#f3d2a2] font-semibold text-[#8a4b0f] ${ring ? "ring-4 ring-white shadow-[0_6px_22px_-8px_rgba(138,75,15,0.45)]" : ""}`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
    {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" className="h-full w-full object-cover object-top" loading="lazy" /> : letter}
  </span>;
}
