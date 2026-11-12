import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-poppins" });
const cc = localFont({ src: "./fonts/CCThisManThisMonster.ttf", variable: "--font-cc" });

export const metadata: Metadata = {
  title: "Bluni",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${nunito.variable} ${poppins.variable} ${cc.variable}`}>
      <body>{children}</body>
    </html>
  );
}
