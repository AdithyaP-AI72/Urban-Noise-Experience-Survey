import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or your Geist font
import "./globals.css";
import Script from "next/script"; // Import the Next.js Script component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundScape Survey",
  description: "A survey on urban noise pollution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        
        {/* *** ADD THIS SCRIPT *** */}
        {/* This loads the webaudio-controls library */}
        <Script
          src="https://webaudio.github.io/webaudio-controls/webaudio-controls.min.js"
          strategy="beforeInteractive" // Load it early
        />
      </body>
    </html>
  );
}
