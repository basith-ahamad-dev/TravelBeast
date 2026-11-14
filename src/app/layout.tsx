import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Mr_Dafoe, Poppins } from "next/font/google";
import "./globals.css";

// condensed display face for big headings + brush script for the small "kicker" lines
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-barlow", display: "swap" });
const dafoe = Mr_Dafoe({ subsets: ["latin"], weight: "400", variable: "--font-dafoe", display: "swap" });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "TravelBeast Tourism | Discover the World, One Adventure at a Time", template: "%s | TravelBeast Tourism" },
  description:
    "Carefully planned travel packages to Bali, the Maldives, Sri Lanka, Phuket and more. Explore destinations and plan your next adventure with TravelBeast Tourism.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${barlow.variable} ${dafoe.variable}`}>
      <body>{children}</body>
    </html>
  );
}
