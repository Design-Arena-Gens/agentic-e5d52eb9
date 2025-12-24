import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sora 2 Video Studio",
  description:
    "Interface profissional para criar vídeos com o Sora 2 usando prompts guiados.",
  metadataBase: new URL("https://agentic-e5d52eb9.vercel.app")
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
