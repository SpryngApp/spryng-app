// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SPRYNG — Register as an employer (free) + stay audit-ready",
  description:
    "Register as an employer, get UI filing reminders, and stay confident with audit-ready records—without the overwhelm.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[color:rgb(var(--bg))] font-sans text-[color:rgb(var(--text))] antialiased">
        {children}
      </body>
    </html>
  );
}
