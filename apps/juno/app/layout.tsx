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

const theFuture = localFont({
  src: [
    {
      path: "../public/assets/fonts/TheFuture-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-ThinItalic.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-ExtralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/assets/fonts/TheFuture-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/TheFuture-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-the-future",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Juno",
  description: "Prototypes to validate functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${theFuture.variable}`} data-theme="educatius">
        {children}
        <ToasterWrapper />
      </body>
    </html>
  );
}
