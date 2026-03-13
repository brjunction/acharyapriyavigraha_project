import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#8c2044] text-white pt-16 pb-8 border-t border-[#65100d]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Column 1: Library Mission */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-widest uppercase">
            GGS Digital Library
          </h3>
          <p className="text-stone-300 text-sm leading-relaxed">
            A centralized digital repository dedicated to the vani and teachings
            of Sri Srimad Gour Govinda Swami Maharaja.
          </p>
        </div>

        {/* Column 2: Sister Websites */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
            Websites
          </h4>
          <ul className="space-y-2 text-sm text-stone-200">
            <li>
              <a href="#" className="hover:text-white transition">
                Taptajivanam
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Tattva Vichar
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Gopal Jiu Publications
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: YouTube Network */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
            Media Channels
          </h4>
          <ul className="space-y-2 text-sm text-stone-200">
            <li>
              <a href="#" className="hover:text-white transition">
                Main Archive Channel
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Lecture Series
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Kirtan & Bhajans
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Social & Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
            Community
          </h4>
          <ul className="space-y-2 text-sm text-stone-200">
            <li>
              <a href="#" className="hover:text-white transition">
                Facebook Page
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Telegram Group
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Support / Donate
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-[#65100d]/50 text-center">
        <p className="text-xs text-amber-200/60 font-sans uppercase tracking-[0.2em]">
          GGS Digital Library • Digital Archive • 2026
        </p>
      </div>
    </footer>
  );
}
