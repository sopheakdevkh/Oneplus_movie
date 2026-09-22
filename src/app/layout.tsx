import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
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
  title: "LensImpact Film Club | Watch Movies & TV Shows",
  description:
    "Stream the latest movies, exclusive originals, and trending TV shows with LensImpact Film Club in cinematic Ultra HD quality.",
  keywords: [
    "LensImpact Film Club",
    "LensImpact",
    "streaming",
    "movies",
    "tv series",
    "cinema",
    "watch online",
    "ultra hd",
  ],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
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
      <body className="min-h-full bg-[#0A0A0C] text-white flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
