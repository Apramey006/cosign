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
  title: "Cosign — the AI broke-friend who vets your purchases",
  description:
    "Upload a screenshot of anything you're about to buy. Get the honest verdict your group chat is too polite to give.",
  openGraph: {
    title: "Cosign",
    description: "You need a cosigner for that purchase.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-zinc-100 antialiased min-h-screen flex flex-col font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
