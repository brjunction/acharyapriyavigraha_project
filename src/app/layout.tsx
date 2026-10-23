import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { Providers } from "@/components/providers";


export const metadata: Metadata = {
  title: { default: "Taptajīvanam · The teachings of Śrīla Gour Govinda Swāmī", template: "%s · Taptajīvanam" },
  description: "Lectures, transcriptions, books, quotes, letters and photos of Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
