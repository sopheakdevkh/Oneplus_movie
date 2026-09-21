import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oneplus Movie | Premium Streaming Experience",
  description:
    "Explore top rated blockbusters, exclusive action cinema, sci-fi sagas, and animations in stunning 4K HDR on Oneplus Movie.",
  keywords: [
    "movies",
    "streaming",
    "oneplus movie",
    "cinema",
    "top rated",
    "action movies",
    "sci-fi",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0A0A0C] text-white flex flex-col">{children}</body>
    </html>
  );
}
