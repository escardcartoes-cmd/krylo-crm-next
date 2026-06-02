import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Krylo — Cartões & Benefícios",
    template: "%s · Krylo",
  },
  description: "CRM inteligente para vendas de cartões private label e programas de benefícios.",
  applicationName: "Krylo",
  icons: {
    icon: [
      { url: "/krylo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/krylo-icon.svg",
  },
  openGraph: {
    title: "Krylo",
    description: "CRM para vendas de cartões private label.",
    siteName: "Krylo",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
