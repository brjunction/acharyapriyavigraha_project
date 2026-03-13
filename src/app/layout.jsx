import "./globals.css";
import { Navbar } from "./components/ui/Navbar";
import { Footer } from "./components/ui/Footer";
import localFont from "next/font/local";
import {
  Alike_Angular,
  Bellefair,
  Cormorant_Upright,
  EB_Garamond,
  Inter,
  Noto_Serif,
  Sorts_Mill_Goudy,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin"], // pick only what you need
  variable: "--font-inter", // optional: for CSS variable usage
  weight: ["400", "500", "600", "700"],
  display: "swap", // recommended for performance
});

const inriaSerif = Alike_Angular({
  subsets: ["latin"],
  variable: "--font-inria",
  weight: ["400"],
});

export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700"],
});

// Load the local font
const googleSans = localFont({
  src: "../fonts/GoogleSans-Variable.woff2",
  variable: "--font-googleSans",
});

export const metadata = {
  title: "Sravana Managalam",
  description:
    "The digital collection of the vani and teachings of His Holiness Haladhara Swami Maharaja",
  icons: {
    icon: "/hds_favicon.jpg", // This looks in the 'public' folder
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${inter.variable} ${notoSerif.variable} ${inriaSerif.variable} antialiased `}
    >
      <head>
        <meta
          name="google-site-verification"
          content="A0wYp6OHY16TtZb5ua8xmcSaN4D1YiLzLHOfULCdFZw"
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
