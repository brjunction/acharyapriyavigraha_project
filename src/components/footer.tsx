import Link from "next/link";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { SITE, IMG } from "@/lib/data";
import { getMenus } from "@/lib/menus-server";
import { PaisleyField, LogoMark, Toran, Orn } from "./motifs";
import { Signature } from "./signature";

const SOCIAL_ICONS = { Instagram, Facebook, YouTube: Youtube } as const;

export async function Footer() {
  const MENUS = await getMenus();
  return (
    <footer className="mt-24">
      <Toran className="text-[#592300]" />
      <div className="footer-paisley relative overflow-hidden">
        <PaisleyField className="text-[#3d1500]/70" scale={1.3} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(232,163,58,0.22),transparent)]" />
        <div className="relative mx-auto max-w-[1180px] px-5 pb-8 pt-14 sm:px-8">

          {/* The verse: a framed card in the centre, signature beneath */}
          <div className="relative mx-auto max-w-3xl pt-20 text-center">
            <Orn src="mandala-gold" className="spin-slow absolute left-1/2 top-[44%] h-[560px] w-[560px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.17]" />
            <span className="absolute left-1/2 top-0 z-10 block h-[148px] w-[148px] -translate-x-1/2 rounded-full bg-[#5d140c] p-2 shadow-[0_14px_34px_rgba(0,0,0,0.5)] ring-2 ring-[#e8b872]/60"><Orn src="mandala-gold" className="spin-slow h-full w-full" /></span>
            <div className="relative rounded-[28px] border border-white/20 bg-gradient-to-b from-white/[0.13] to-white/[0.05] px-6 pb-10 pt-[88px] shadow-[0_34px_70px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm sm:px-14">
              <div className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-dashed border-[#e9c9a8]/30" />
              <p className="relative text-[24px] font-semibold  leading-snug tracking-[-0.02em] text-white sm:text-[29.5px]">{SITE.verse}</p>
              <p className="relative mx-auto mt-4 max-w-xl text-[13.5px] leading-relaxed text-[#f3e2d2]/90">{SITE.verseTranslation}</p>
            </div>
            <div className="mt-7 flex flex-col items-center gap-2">
              <Signature src={IMG.sign} className="h-12 w-auto brightness-0 invert opacity-90" />
            </div>
          </div>

          <div className="mt-24 grid items-start gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {MENUS.slice(0, 3).map((m) => (
              <div key={m.key}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f1d3a4]">{m.label}</h4>
                <ul className="mt-3.5 space-y-1.5 text-[12.5px]">
                  {m.groups.flatMap((g) => g.links).slice(0, 6).map((l) => (
                    <li key={l.href + l.label}><Link href={l.href} className="text-[#f0dfd1]/75 transition hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f1d3a4]">Stay connected</h4>
              <Link href="/about/subscribe" className="group mt-3.5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 transition hover:bg-white/[0.12]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8b872]/90 text-[#4a1a00]"><Mail size={19} /></span>
                <span className="flex-1 text-[12px] leading-snug text-white"><span className="block font-semibold">Gopāl Jiu magazine</span><span className="text-[#f0dfd1]/70">Subscribe to receive it</span></span>
                <ArrowUpRight size={16} className="text-[#f0dfd1]/60 transition group-hover:text-white" />
              </Link>
              <div className="mt-3 flex gap-2">
                {SITE.social.map((s) => { const I = SOCIAL_ICONS[s.name as keyof typeof SOCIAL_ICONS]; return (
                  <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#592300]"><I size={15} /></a>
                ); })}
              </div>
              <ul className="mt-4 space-y-1.5 text-[12px] text-[#f0dfd1]/80">
                <li className="flex items-center gap-2"><Mail size={13} className="text-[#e6c9b4]" />{SITE.email}</li>
                <li className="flex items-center gap-2"><Phone size={13} className="text-[#e6c9b4]" />{SITE.phone}</li>
              </ul>
            </div>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-6 border-t border-white/10 pt-9 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.locations.map((l) => (
              <div key={l.name} className="flex gap-3 text-[12px]">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#e6c9b4]" />
                <div><p className="font-semibold text-white">{l.name}</p>{l.lines.map((x) => <p key={x} className="text-[#f0dfd1]/65">{x}</p>)}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11.5px] text-[#f0dfd1]/65 sm:flex-row">
            <div className="flex items-center gap-2"><LogoMark className="h-6 w-6 text-white" flame="#e8a33a" /><span className="text-[12.5px] font-medium text-white">Dedicated to Śrī Śrīmad Gour Govinda Swāmī Gurudeva</span></div>
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
