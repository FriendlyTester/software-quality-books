import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import ClientRoot from './ClientRoot';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Software Quality Books",
  description: "A collection of books about software quality",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Move client-only providers/components into ClientRoot */}
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
