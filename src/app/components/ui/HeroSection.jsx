import Image from "next/image";
import Link from "next/link";
// import localFont from "next/font/local";

// const googleSans = localFont({
//   subsets: ["latin"],
//   src: "../../fonts/GoogleSans-Variable.woff2",
//   variable: "--font-googleSans", // This creates the CSS variable automatically
// });

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[50vh] md:h-[40vh] overflow-hidden bg-black flex justify-center py-12 md:py-0">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        // style={{ backgroundImage: "url('/heroback.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#fcc95a]" />
      </div>

      {/* Main Content Container: Fixed with 'justify-center' and 'gap' for perfect spacing */}
      <div
        className={`font-sans relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full h-full px-8 md:px-20 max-w-7xl`}
      >
        {/* LEFT SIDE: The Circular Frame (Fixed position) */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Outer Rotating Orbit Ring */}
          <div className="absolute w-55 h-55 md:w-74 md:h-74 rounded-full border-2 border-dashed border-[#8c2044]/30 animate-[spin_30s_linear_infinite]" />

          {/* The Main Designed Frame */}
          <div className="relative w-52 h-52 md:w-70 md:h-70 rounded-full p-[4px] bg-gradient-to-tr from-[#8c2044] to-[#e2c24e] shadow-2xl">
            <div className="w-full h-full rounded-full bg-black border-4 border-[#e2c24e] overflow-hidden flex items-center justify-center">
              <Image
                width={900}
                height={900}
                src="/GGSLogoDesign.png"
                alt="Channel Logo"
                className="w-full h-full object-cover transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Text Content (Optimized gap and alignment) */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          <div className="text-3xl md:text-5xl font-bold text-[#8c2044] tracking-tighter leading-[0.9] mb-6">
            GGS Digital{" "}
            <span className="animate-neon-pulse inline-block">Library</span>
          </div>

          <p className="text-stone-900 font-light leading-relaxed mb-8 text-sm md:text-base">
            A centralized digital repository committed to the rigorous
            organization and preservation of the teachings of Sri Srimad Gour
            Govinda Swami Maharaja.
          </p>

          <div className="flex gap-4 justify-center md:justify-start w-full">
            <button className="px-6 py-3 bg-[#8c2044] text-white font-semibold rounded-lg hover:bg-[#6b0024] transition shadow-md">
              <Link href="/media/audios">Audio Transcripts</Link>
            </button>
            <button className="px-6 py-3 text-[#6b0024] font-medium hover:text-[#8c2044] transition">
              <Link href="/About">Explore Resources →</Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
