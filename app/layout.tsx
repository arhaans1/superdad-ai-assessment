import type { Metadata } from "next";
import { Montserrat, Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Intentional Father Assessment | Platform of Papas",
  description:
    "Discover your Father Archetype and the patterns shaping your family, purpose and ambition."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${montserrat.variable}`}>{children}</body>
    </html>
  );
}
