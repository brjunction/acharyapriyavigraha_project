import { HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui";
import { Backdrop } from "@/components/backdrop";
import { PeacockDivider, VectorToran, OrnMask } from "@/components/motifs";

export const metadata = { title: "Our Thank List" };

const REGIONS: [string, string[]][] = [
  ["Asia", ["Bangladesh", "India: Bangalore, Delhi, Goa, Gujarat, Maharashtra, Odisha, Uttar Pradesh, West Bengal", "Indonesia (Bali)", "Malaysia"]],
  ["Europe", ["England", "Lithuania", "The Netherlands", "Russia"]],
  ["North America", ["California", "Canada", "Florida"]],
];

export default function Page() {
  return (
    <div className="relative isolate overflow-hidden bg-[#3d0709] text-white">
      <Backdrop src="red-gold-mandala" o={0} className="-z-10 opacity-60" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#3d0307]/60 via-[#3d0307]/30 to-[#3d0307]/80" />
      <VectorToran flip className="text-[#e8b872]/35" />
      <Container className="relative py-14 sm:py-16">
        <nav className="text-[12px] text-white/70"><a href="/" className="hover:text-white">Home</a> / <a href="/about" className="hover:text-white">About</a> / <span className="text-white">Our Thank List</span></nav>
        <h1 className="mt-5 flex items-center gap-3 text-[26px] text-white sm:text-[31.5px]"><HeartHandshake size={28} strokeWidth={1.5} className="text-[#f1d3a4]" />Our Thank List</h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-white/85">This archive is being built by the efforts of the disciples, grand-disciples, followers and admirers of Śrī Śrīmad Gour Govinda Swāmī Gurudeva.</p>
      </Container>
      <Container className="relative max-w-3xl pb-20">
        <blockquote className="text-center text-[17.5px] italic leading-snug text-white">“Your love for me will be shown by how you cooperate with one another.”</blockquote>
        <p className="mt-3 text-center text-[13px] text-[#f3d9a4]">His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda</p>
        <PeacockDivider className="my-10" size={80} />
        <p className="mx-auto max-w-2xl text-center text-[14px] leading-relaxed text-white/85">The full Thank List, written by Yati Śekhara Dāsa (Bhubaneswar, Padminī Ekādaśī, 29 July 2023), is moved over word for word, with every name, region and service, and is editable in the dashboard.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {["Gratitude to Śrīpād Caitanya Chandra Dāsa Mahārāja", "Core contributors", "Audio remastering", "Web designers and web hosts"].map((s) => <div key={s} className="rounded-2xl border border-[#e8b872]/35 bg-white/[0.07] p-5 text-[14.5px] font-semibold text-[#fdebc4] backdrop-blur-sm">{s}</div>)}
        </div>
        {REGIONS.map(([r, l]) => (
          <div key={r} className="mt-10"><h2 className="text-[17.5px] text-[#e8b872]">{r}</h2><ul className="mt-3 space-y-1.5 text-[14px] text-white/85">{l.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}
        <OrnMask src="border-5" repeat="repeat-x" size="auto 100%" className="mx-auto mt-14 h-5 max-w-xs text-[#e8b872]/40" />
      </Container>
      <VectorToran className="text-[#e8b872]/35" />
    </div>
  );
}
