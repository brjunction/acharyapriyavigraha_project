import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[88vh] overflow-hidden bg-[#0f1f0f] flex items-center justify-center">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(195,163,84,0.07),transparent)] pointer-events-none" />

      {/* Corner ornament top-left */}
      <div className="absolute top-8 left-8 hidden md:block opacity-20 pointer-events-none">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path d="M4 4 L4 32 M4 4 L32 4" stroke="#c3a354" strokeWidth="1.5" />
          <circle cx="4" cy="4" r="2.5" fill="#c3a354" />
        </svg>
      </div>
      {/* Corner ornament bottom-right */}
      <div className="absolute bottom-8 right-8 hidden md:block opacity-20 pointer-events-none rotate-180">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path d="M4 4 L4 32 M4 4 L32 4" stroke="#c3a354" strokeWidth="1.5" />
          <circle cx="4" cy="4" r="2.5" fill="#c3a354" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 w-full max-w-6xl px-8 md:px-20 py-20 md:py-0">
        {/* Portrait */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Outer dashed orbit */}
          <div className="absolute w-72 h-72 rounded-full border border-dashed border-[#c3a354]/18 animate-[spin_40s_linear_infinite]" />
          {/* Inner solid ring */}
          <div className="absolute w-60 h-60 rounded-full border border-[#c3a354]/10" />

          {/* Orbit dots */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#c3a354]/45"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${deg}deg) translateX(120px) translate(-50%, -50%)`,
              }}
            />
          ))}

          {/* Image frame */}
          <div className="w-52 h-52 rounded-full p-[3px] bg-linear-to-br from-[#c3a354] via-[#e8d08a] to-[#a07c2e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0f1f0f] border-3 border-[#1a2e1a]">
              <Image
                width={600}
                height={600}
                src="/hds_favicon.jpg"
                alt="His Holiness Haladhara Swami"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-2 bg-[#c3a354]/10 border border-[#c3a354]/22 rounded px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c3a354] shrink-0" />
            <span className="font-serif text-[10px] text-[#c3a354] tracking-[0.2em] uppercase">
              Digital Archive
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#f0e6c8] leading-[1.02] tracking-tight">
            Sravana
          </h1>
          <h1 className="font-serif text-5xl md:text-6xl font-normal italic text-[#c3a354] leading-[1.02] tracking-tight mb-5">
            Mangalam
          </h1>

          {/* Accent line */}
          <div className="w-12 h-px bg-linear-to-r from-[#c3a354] to-transparent mb-6 self-center md:self-start" />

          {/* Description */}
          <p className="font-serif text-[#e0d2af]/60 text-sm leading-[1.85] mb-9">
            A dedicated digital archive committed to the systematic preservation
            of the lectures and writings of His Holiness Haladhara Swami —
            offering reverent, accessible entry to his enduring teachings.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              href="/media/audios"
              className="px-6 py-3 bg-linear-to-r from-[#c3a354] to-[#a07c2e] text-[#0f1f0f] font-serif font-bold text-xs tracking-widest uppercase rounded-md shadow-[0_4px_18px_rgba(195,163,84,0.22)] hover:brightness-110 transition-all duration-200"
            >
              Audio Transcripts
            </Link>
            <Link
              href="/About"
              className="px-6 py-3 font-serif text-xs text-[#c3a354]/80 tracking-widest uppercase border border-[#c3a354]/20 rounded-md hover:border-[#c3a354]/50 hover:text-[#c3a354] transition-all duration-200"
            >
              Explore →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
