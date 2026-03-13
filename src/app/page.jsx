import Image from "next/image";
import Link from "next/link";
import { HeroSection } from "./components/ui/HeroSection";
import { BookOpen, Headphones, ExternalLink } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#0a160a] border-t border-[#c3a354]/15">
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-14">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#c3a354] to-[#e8d08a] flex items-center justify-center">
                <span className="font-serif text-[11px] font-bold text-[#0a160a]">
                  SM
                </span>
              </div>
              <span className="font-serif text-sm text-[#e8d08a]/80 tracking-widest">
                Sravana Mangalam
              </span>
            </div>
            <p className="font-serif text-xs text-[#e0d2af]/35 max-w-[220px] text-center md:text-left leading-relaxed">
              Preserving the teachings of His Holiness Haladhara Swami for
              generations to come.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-serif text-[10px] text-[#c3a354]/70 tracking-[0.2em] uppercase mb-1">
              Archive
            </span>
            {[
              { href: "/media/audios", label: "Audio Transcripts" },
              { href: "/news", label: "News" },
              { href: "/About", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-serif text-xs text-[#e0d2af]/50 hover:text-[#c3a354] transition-colors duration-200 tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#c3a354]/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-serif text-[11px] text-[#e0d2af]/25 tracking-wide">
            © {new Date().getFullYear()} Sravana Mangalam. All rights reserved.
          </p>
          <p className="font-serif text-[11px] text-[#e0d2af]/20 italic">
            Dedicated to the lotus feet of the Vaishnava saints.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#0f1f0f] min-h-screen">
      <HeroSection />

      {/* Quote Section */}
      <section
        className="py-28 px-8 md:px-20"
        style={{
          background:
            "linear-gradient(180deg, #0f1f0f 0%, #152515 40%, #1a2e1a 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-12 justify-center">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-[#c3a354]/50" />
            <span className="font-serif text-[10px] text-[#c3a354]/70 tracking-[0.25em] uppercase">
              From the teachings
            </span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-[#c3a354]/50" />
          </div>

          {/* Quote card */}
          <div className="relative border border-[#c3a354]/15 rounded-xl p-8 md:p-12 bg-[#c3a354]/3">
            {/* Large decorative quote mark */}
            <span
              className="absolute top-4 left-6 font-serif text-7xl text-[#c3a354]/10 leading-none select-none"
              aria-hidden="true"
            >
              "
            </span>

            <blockquote className="relative">
              <p className="font-serif text-[#e0d2af]/75 text-sm md:text-base leading-[2] mb-8">
                Jīva, as I say, is the eternal, fragmental part and parcel of
                the Lord, and His child. Therefore, he is very dear to Kṛṣṇa.
                You have forgotten Kṛṣṇa. You are not thinking of Him, you are
                not calling Him, but Bhagavān, the Supreme Lord is always
                thinking of you. He is calling you. You are not calling Him, but
                He is calling you. If you have ears, you can hear how He is
                calling you. Those who are{" "}
                <em className="text-[#e0d2af]/90 not-italic">
                  nitya-sidhha pārṣadas
                </em>
                , eternal dear devotees of Kṛṣṇa, they always hear how Kṛṣṇa is
                calling them through His sweet flute. Kṛṣṇa sends His most
                intimate, eternal associates — &ldquo;Go and preach this science
                of Kṛṣṇa consciousness. Distribute this{" "}
                <em className="text-[#e0d2af]/90 not-italic">bhakti-dhana</em>;
                this invaluable treasure of{" "}
                <em className="text-[#e0d2af]/90 not-italic">bhakti</em>.&rdquo;
              </p>
              <footer className="flex items-center gap-4">
                <div className="h-px w-8 bg-[#c3a354]/40" />
                <cite className="font-serif text-xs text-[#c3a354] tracking-wide not-italic">
                  Śrī Śrīmad Gour Govinda Swami Mahārāja
                </cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 px-8 md:px-20 bg-[#0f1f0f]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/media/audios"
            className="group flex items-start gap-5 border border-[#c3a354]/12 rounded-xl p-7 bg-[#c3a354]/3 hover:bg-[#c3a354]/7 hover:border-[#c3a354]/25 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-[#c3a354]/12 flex items-center justify-center shrink-0 group-hover:bg-[#c3a354]/20 transition-colors duration-300">
              <Headphones
                size={18}
                className="text-[#c3a354]"
                strokeWidth={1.6}
              />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#f0e6c8] mb-1.5 tracking-wide">
                Audio Transcripts
              </h3>
              <p className="font-serif text-xs text-[#e0d2af]/45 leading-relaxed">
                Recorded lectures transcribed and preserved for careful study
                and reflection.
              </p>
            </div>
          </Link>

          <Link
            href="/About"
            className="group flex items-start gap-5 border border-[#c3a354]/12 rounded-xl p-7 bg-[#c3a354]/3 hover:bg-[#c3a354]/7 hover:border-[#c3a354]/25 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-[#c3a354]/12 flex items-center justify-center shrink-0 group-hover:bg-[#c3a354]/20 transition-colors duration-300">
              <BookOpen
                size={18}
                className="text-[#c3a354]"
                strokeWidth={1.6}
              />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#f0e6c8] mb-1.5 tracking-wide">
                About the Archive
              </h3>
              <p className="font-serif text-xs text-[#e0d2af]/45 leading-relaxed">
                Learn about the mission to preserve and share these sacred
                teachings.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
