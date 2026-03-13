import Image from "next/image";
import React from "react";
import { HeroSection } from "./components/ui/HeroSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <section
        className="py-28 px-6 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(#ffe3bee2, #ffe3bee2), url('/heroback.jpg')",
        }}
      >
        <div className="md:px-20 mx-auto ">
          <blockquote className="md:border-l-3 border-l-2 rounded text-[#000000e2] border-[#d53970] pl-8">
            <div>
              Jīva, as I say, is the eternal, fragmental part and parcel of the
              Lord, and His child. Therefore, he is very dear to Kṛṣṇa. Do you
              understand? He is very dear to Kṛṣṇa. You have forgotten Kṛṣṇa. Do
              you understand? You are not thinking of Him, you are not calling
              Him, but Bhagavān, the Supreme Lord is always thinking of you. He
              is calling you. You are not calling Him, but He is calling you. If
              you have ears, you can hear how He is calling you. Do you
              understand? Those who are <em>nitya-sidhha pārṣadas</em>, eternal{" "}
              <em>pārṣadas</em>, dear devotees of Kṛṣṇa, they always hear how
              Kṛṣṇa is calling them. Kṛṣṇa has a flute His hands; through His
              sweet singing of His flute, He is calling. Do you understand?
              Because of His such mercy, He send His dear devotees, His eternal
              associates; very intimate, eternal associates to this material
              world. Why? &ldquo;Go and preach this science of Kṛṣṇa
              consciousness. Preach the science of devotional service.
              Distribute this <em>bhakti-dhana</em>; this treasure, invaluable
              treasure, this bhakti.&rdquo; Do you understand? Kṛṣṇa makes such
              an arrangement. He sends His most intimate, eternal associates,
              dear devotees; and Śrīla Prabhupāda is one of them ― the most
              intimate, eternal associate of Kṛṣṇa. Kṛṣṇa sent him here,
              &ldquo;Go to the material world and preach the science of Kṛṣṇa
              consciousness! Distribute this bhakti-dhana; this invaluable
              treasure [of] <em>bhakti</em>.&rdquo;
            </div>

            <footer className="mt-6 font-scagoudy text-md font-bold text-[#8c2044] tracking-wide">
              — Sri Srimad Gour Govinda Swami Maharaja
            </footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
