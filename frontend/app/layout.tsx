import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OmniCart AI — Smart Grocery Comparison",
  description:
    "Compare prices across Blinkit, Zepto, Instamart & BigBasket. Get the best deals with AI-powered smart grocery shopping.",
  keywords: ["grocery", "price comparison", "blinkit", "zepto", "instamart", "bigbasket", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
