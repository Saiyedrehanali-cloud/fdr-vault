import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dmserif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinMatrix — AICTE Security Deposit & FDR Management Portal",
  description:
    "Centralized Fixed Deposit Receipt (FDR) and Security Deposit management portal for AICTE approved technical institutions. SIH 2026 PS SIH26265.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased bg-[#F8FAFC] text-[#0F2A30]">
        {children}
      </body>
    </html>
  );
}
