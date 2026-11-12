/* A book as an object: the cover with its spine and a soft shadow; when there is no cover picture, a quiet bound cover with the title. */
export function Cover({ src, title, className = "" }: { src?: string | null; title: string; className?: string }) {
  return (
    <span className={`relative block aspect-[3/4] overflow-hidden rounded-[2px_7px_7px_2px] shadow-[0_1px_2px_rgba(60,30,0,0.25),0_12px_24px_-12px_rgba(60,30,0,0.55)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_2px_4px_rgba(60,30,0,0.2),0_22px_34px_-14px_rgba(60,30,0,0.6)] ${className}`}>
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        : <span className="flex h-full flex-col items-center justify-center bg-[radial-gradient(120%_90%_at_50%_20%,#7a3410_0%,#4a1d07_60%,#2e1204_100%)] p-[10%] text-center">
            <span className="absolute inset-[7%] rounded-[2px] border border-[#d9a85a]/45" />
            <svg viewBox="0 0 40 24" className="mb-3 w-[28%] text-[#e3b56a]" fill="currentColor" aria-hidden><path d="M20 2c3 4 3 9 0 14-3-5-3-10 0-14Z" /><path d="M8 8c5 1 9 5 11 10-6 0-10-3-11-10Zm24 0c-1 7-5 10-11 10 2-5 6-9 11-10Z" opacity=".8" /><path d="M2 15c6-1 12 1 17 5H3c-1-2-1-3-1-5Zm36 0c0 2 0 3-1 5H21c5-4 11-6 17-5Z" opacity=".55" /></svg>
            <span className="line-clamp-4 text-[clamp(10px,1.05vw,13.5px)] font-medium leading-snug text-[#f6e3c2]">{title}</span>
          </span>}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[7%] w-px bg-white/15" />
    </span>);
}
