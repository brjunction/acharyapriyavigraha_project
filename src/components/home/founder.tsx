/* The founder section of the home page, shared by the home page and its new draft. Kept exactly as the owner set it. */
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui";
import { Padma, PortraitFrame, VMask } from "@/components/motifs";
import { Backdrop } from "@/components/backdrop";

function SectionBg({ src, o = 0.4, flip = false, pos = "center" }: { src: string; o?: number; flip?: boolean; pos?: string }) {
  return (
    <>
      <Backdrop src={src} o={o} flip={flip} pos={pos} className="-z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-page via-transparent to-page" />
    </>
  );
}

function Head({ kicker, title, intro, action, acc = "saffron", light = false }: { light?: boolean; kicker: string; title: string; intro?: string; action?: { href: string; label: string }; acc?: string }) {
  return (
    <div className={`acc-${acc} mb-5 flex flex-wrap items-end justify-between gap-4`}>
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]"><Padma className="h-3.5 w-3.5" layers={2} />{kicker}</p>
        <h2 className={`mt-1 text-[19.5px] leading-tight tracking-[-0.025em] sm:text-[23px] ${light ? "!text-white" : ""}`}>{title}</h2>
        {intro && <p className={`mt-2 max-w-xl text-[12.5px] ${light ? "text-white/80" : "text-ink-2"}`}>{intro}</p>}
      </div>
      {action && <Link href={action.href} className={`group flex items-center gap-1 text-[12.5px] font-medium ${light ? "text-[#f3d9a4]" : "text-[var(--acc)]"}`}>{action.label}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>}
    </div>
  );
}

function FounderHeroCard({ children, className = "", contentClassName = "" }: { children: React.ReactNode; className?: string; contentClassName?: string }) {
  return (
    <div className={`founder-hero-card card relative isolate h-full overflow-hidden ${className}`}>
      <Backdrop src="saffron-dark" flip pos="left center" o={0.4} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[radial-gradient(70%_80%_at_80%_40%,rgba(243,179,99,0.28),transparent_65%),linear-gradient(100deg,rgba(70,26,3,0.55),transparent_60%)]" />
      <VMask name="mandala-saffron" className="hero-spin-rev pointer-events-none absolute -bottom-56 -left-48 h-[620px] w-[620px] text-[#f3b363] opacity-[0.02]" />
      <VMask name="paisley-red" repeat="repeat" size="380px" className="pointer-events-none absolute inset-0 text-[#f3b363] opacity-[0.02]" />
      <div className={`relative z-10 h-full ${contentClassName}`}>{children}</div>
    </div>
  );
}

export function FounderSection() {
  return (
    <>
      {/* Founder */}
      <section className="reveal relative isolate mt-12 py-8">
        <SectionBg src="cream-watercolor" o={0.6} flip />
        <Container>
          <Head kicker="The founder" title="How Taptajīvanam began" action={{ href: "/about/founder", label: "Read his biography" }} />
          <div className="grid items-stretch gap-3 lg:grid-cols-[290px_minmax(0,1fr)]">
            <FounderHeroCard contentClassName="flex flex-col items-center p-5 text-center sm:p-6">
              <div className="w-[150px] shrink-0"><PortraitFrame photo src="/photos/haladhara.webp" alt="Śrīla Haladhara Swāmī Guru Mahārāja" className="w-full" /></div>
              <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#f3d9a4]">Founder of Taptajīvanam</p>
              <p className="mt-1 text-[14px] font-semibold leading-snug text-white">Śrīla Haladhara Swāmī <br />Guru Mahārāja</p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-white/80">ISKCON Guru and Sannyasi — travels and preaches Krsna Consciousness all around the world, sharing the teachings of Śrīla Prabhupāda and Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
              <div className="mt-5 w-full border-t border-white/25 pt-4 text-left">
                <p className="mb-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                  <MapPin size={12} className="text-[#f3d9a4]" /> His service and mission
                </p>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/65">Disciple of</dt>
                    <dd className="mt-0.5 text-[11.5px] font-medium text-white">Śrīla Gurudeva</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/65">Grand Disciple of</dt>
                    <dd className="mt-0.5 text-[11.5px] font-medium text-white">Śrīla Prabhupāda</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/65">Preaches in</dt>
                    <dd className="mt-0.5 text-[11.5px] font-medium text-white">Odia · Hindi · English</dd>
                  </div>
                </dl>
              </div>
              <p className="mt-5 w-full rounded-xl border border-[#f3b363]/35 bg-white/10 px-3 py-2.5 text-[11px] font-medium leading-relaxed text-[#f3d9a4]">
                Śrī Guru Sevā <span aria-hidden="true">·</span> Śrī Nāma Sevā
              </p>
            </FounderHeroCard>
            <FounderHeroCard className="founder-profile founder-timeline" contentClassName="p-5 text-ink sm:p-7">
              <ol aria-label="Founder timeline" className="ml-1.5 border-l border-line">
              {[
                ["acc-teal", "1992", "Joins ISKCON Bhubaneswar", "Comes into contact with the devotees at ISKCON Bhubaneswar and begins to join their service."],
                ["acc-leaf", "1994", "Initiation", "Initiated as Halāyudha Dāsa. Serves in the travelling saṅkīrtana party and as head pūjārī of Śrī Śrī Kṛṣṇa-Balarāma Temple."],
                ["acc-indigo", "2016", "Sannyāsa", "Accepts the renounced order on 20 March 2016, from His Holiness Rādhā-Govinda Swāmī Mahārāja, at Śrī Śrī Kṛṣṇa-Balarāma Temple."],
                ["acc-saffron", "2019 · France", "The wish for one digital home - Taptajivanam", "During his European tour, at ISKCON New Māyāpura, Śrīla Haladhara Swāmī Guru Mahārāja expressed his cherished desire to create a platform where all the audio lectures of his spiritual master would be available to everyone."],
                ["acc-rose", "2020 · The daily offering", "Small clips, every day", "With the help of his disciples and followers he began curating daily selections of quotes and lectures, turned into small audio clips that capture the essence of Gurudeva’s teachings."],
                ["acc-gold", "Thirty years", "Simple living, high thinking", "Emphasises serving the spiritual master (śrī guru-sevā) and chanting the holy names (śrī nāma-sevā) without compromise."],
              ].map(([c, y, t, d]) => (
                <li key={y} className={`${c} relative pb-6 pl-6 last:pb-0 sm:pl-8`}>
                  <span aria-hidden="true" className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-[var(--acc)] ring-4 ring-surface" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] tabular text-[var(--acc)]">{y}</p>
                  <p className="mt-1 text-[13px] font-semibold text-ink">{t}</p>
                  <p className="mt-1.5 text-[11.5px] leading-[1.6] text-ink-2 sm:text-[12px] sm:leading-[1.7]">{d}</p>
                </li>
              ))}
              </ol>
            </FounderHeroCard>
          </div>
        </Container>
      </section>

    </>
  );
}
