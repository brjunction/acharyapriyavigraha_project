import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/gentium-book-plus/400.css";
import "@fontsource/gentium-book-plus/400-italic.css";
import "@fontsource/gentium-book-plus/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Taptajīvanam.com — Life and Teachings of Śrī Śrīmad Gour Govinda Swāmī Gurudeva", template: "%s — Taptajīvanam.com" },
  description: "Lectures, transcriptions, books, quotes, letters and photos of Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī Gurudeva.",
  icons: { icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }, { url: "/favicon-48.png", sizes: "48x48", type: "image/png" }], shortcut: "/favicon.ico", apple: "/apple-icon.png" },
};
export const viewport: Viewport = { themeColor: "#853500" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.theme="light";` }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
