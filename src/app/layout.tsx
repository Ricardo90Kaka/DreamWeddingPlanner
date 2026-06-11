import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Droombruiloft Planner",
    template: "%s | Droombruiloft Planner",
  },
  description:
    "Een prive wedding planner met budget, gastenlijst, to-do's en admin-login.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${manrope.variable} ${cormorant.variable} font-sans antialiased`}>
        <div className="app-background">{children}</div>
      </body>
    </html>
  );
}
