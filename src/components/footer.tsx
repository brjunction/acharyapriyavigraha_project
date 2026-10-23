import Link from "next/link";
import { Instagram, Facebook, MessageCircle, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { SITE, IMG } from "@/lib/data";
import { MENUS } from "@/lib/nav";
import { FlowerBand, PaisleyField, LogoMark } from "./motifs";
import { Img } from "./ui";

const SOCIAL_ICONS = { Instagram, Facebook, WhatsApp: MessageCircle, YouTube: Youtube } as const;

export function Footer() {
  return (
    <footer className="mt-24">
      <FlowerBand />
      <div className="footer-paisley relative overflow-hidden">
        <PaisleyField className="text-[#4c1b00]" scale={1.6} />
        <div className="relative mx-auto max-w-[1240px] px-5 pb-8 pt-14 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="font-serif text-[30px] italic leading-tight text-white sm:text-[38px]">{SITE.verse}</p>
              <p className="mt-3 max-w-xl font-serif text-[17px] leading-relaxed text-[#f3e3d6]">{SITE.verseTranslation}</p>
              <p className="mt-2 text-[13px] text-[#e6c9b4]/80">{SITE.verseSource}</p>
            </div>
            <div className="flex items-center gap-4 lg:justify-end">
              <Img src={IMG.sign} alt="Signature of Śrīla Gurudeva" className="h-14 w-auto opacity-90 brightness-0 invert" fallback="" />
            </div>
          </div>

          <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.25fr]">
            {MENUS.slice(0, 3).map((m) => (
              <div key={m.key}>
                <h4 className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-white">{m.label}</h4>
                <ul className="mt-4 space-y-2 text-[14px]">
                  {m.groups.flatMap((g) => g.links).slice(0, 6).map((l) => (
                    <li key={l.href + l.label}><Link href={l.href} className="text-[#f0dfd1]/80 transition hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-white">Connect with us</h4>
              <div className="mt-4 flex gap-2">
                {SITE.social.map((s) => { const I = SOCIAL_ICONS[s.name as keyof typeof SOCIAL_ICONS]; return (
                  <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white hover:text-[#592300]"><I size={17} /></a>
                ); })}
              </div>
              <ul className="mt-5 space-y-2 text-[14px] text-[#f0dfd1]/85">
                <li className="flex items-center gap-2"><Mail size={14} className="text-[#e6c9b4]" />{SITE.email}</li>
                <li className="flex items-center gap-2"><Phone size={14} className="text-[#e6c9b4]" />{SITE.phone}</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
            {SITE.locations.map((l) => (
              <div key={l.name} className="flex gap-3 text-[13.5px]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#e6c9b4]" />
                <div><p className="font-semibold text-white">{l.name}</p>{l.lines.map((x) => <p key={x} className="text-[#f0dfd1]/75">{x}</p>)}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[12.5px] text-[#f0dfd1]/70 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7 text-white" />
              <span className="font-serif text-[15px] text-white">Dedicated to Śrīla Gour Govinda Swāmī</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <Link href="/thank-list" className="hover:text-white">Our Thank List</Link>
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/about/contact" className="hover:text-white">Contact</Link>
              <span>© Taptajīvanam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
