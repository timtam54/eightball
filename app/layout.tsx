import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EightBall Games",
  description: "A collection of classic games including Tetris and more",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: '/manifest.json',
  themeColor: '#4169E1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EightBall Games',
  },
  icons: {
    icon: [
      { url: '/api/generate-icons', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/api/generate-icons', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/api/generate-icons', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
