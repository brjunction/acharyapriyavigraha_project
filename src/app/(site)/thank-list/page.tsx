import { HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui";
import { Backdrop } from "@/components/backdrop";
import { Ornament } from "@/components/motifs";

export const metadata = { title: "Our Thank List" };

const REGIONS: [string, string[]][] = [
  ["Asia", ["Bangladesh", "India: Bangalore, Delhi, Goa, Gujarat, Maharashtra, Odisha, Uttar Pradesh, West Bengal", "Indonesia (Bali)", "Malaysia"]],
  ["Europe", ["England", "Lithuania", "The Netherlands", "Russia"]],
  ["North America", ["California", "Canada", "Florida"]],
];

export default function Page() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#5a0509] text-white">
        <Backdrop src="red-gold-mandala" o={0.55} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#3d0307]/80 via-[#5a0509]/50 to-[#3d0307]/70" />
        <Container className="relative py-14 sm:py-16">
          <nav className="text-[12.5px] text-white/70"><a href="/" className="hover:text-white">Home</a> / <a href="/about" className="hover:text-white">About</a> / <span className="text-white">Our Thank List</span></nav>
          <h1 className="mt-5 flex items-center gap-3 text-[28px] text-white sm:text-[34px]"><HeartHandshake size={28} strokeWidth={1.5} className="text-[#f1d3a4]" />Our Thank List</h1>
          <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-white/85">This archive is being built by the efforts of the disciples, grand-disciples, followers and admirers of Śrīla Gour Govinda Swāmī.</p>
        </Container>
      </section>
      <Container className="max-w-3xl py-16">
        <blockquote className="text-center font-serif text-[20px] italic leading-snug text-ink">“Your love for me will be shown by how you cooperate with one another.”</blockquote>
        <p className="mt-3 text-center text-[14px] text-ink-3">His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda</p>
        <Ornament className="my-10" />
        <div className="reading mx-auto">
          <p>The full Thank List, written by Yati Śekhara Dāsa (Bhubaneswar, Padminī Ekādaśī, 29 July 2023), is moved over word for word, with every name, region and service, and is editable in the dashboard.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {["Gratitude to Śrīpād Caitanya Chandra Dāsa Mahārāja", "Core contributors", "Audio remastering", "Web designers and web hosts"].map((s) => <div key={s} className="card p-5 font-serif text-[18px] font-bold">{s}</div>)}
        </div>
        {REGIONS.map(([r, l]) => (
          <div key={r} className="mt-10"><h2 className="text-[20px] text-saffron">{r}</h2><ul className="mt-3 space-y-1.5 text-[15.5px] text-ink-2">{l.map((x) => <li key={x}>{x}</li>)}</ul></div>
        ))}
      </Container>
    </>
  );
}
