import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Bishop AI — GTM Automation & AI RevOps Agency",
  description:
    "Founded by Richmond Taylor, Bishop AI is a premium AI automation and education agency. We build high-end GTM systems, done-for-you automation, and custom training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-sans antialiased bg-[#000D1A] text-[#EDE9E2]`}>
        {children}
      </body>
    </html>
  );
}
