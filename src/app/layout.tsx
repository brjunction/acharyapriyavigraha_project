import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/gentium-book-plus/400.css";
import "@fontsource/gentium-book-plus/400-italic.css";
import "@fontsource/gentium-book-plus/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Taptajīvanam · The teachings of Śrīla Gour Govinda Swāmī", template: "%s · Taptajīvanam" },
  description: "Lectures, transcriptions, books, quotes, letters and photos of Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#853500" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var p=JSON.parse(localStorage.getItem('tj-prefs')||'{}');var t=p.theme;if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t)document.documentElement.dataset.theme=t;}catch(e){}` }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
