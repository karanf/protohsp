import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@repo/designsystem/styles.css";
import "@repo/ui/styles.css";
import { ToasterWrapper } from "./components/toaster-wrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Greenheart",
  description: "Prototypes to validate functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} data-theme="greenheart">
        {children}
        <ToasterWrapper />
      </body>
    </html>
  );
}
