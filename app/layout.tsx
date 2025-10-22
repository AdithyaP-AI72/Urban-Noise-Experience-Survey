// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // <-- Use Inter font
import "./globals.css";

// Set up the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundScape Survey", // <-- Changed title
  description: "A survey on urban noise pollution.", // <-- Changed description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}