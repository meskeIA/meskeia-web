import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { generateBaseMetadata } from '@/lib/metadata';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Viewport configuration (Next.js 16+)
export const viewport: Viewport = {
  themeColor: '#2E86AB',
  width: 'device-width',
  initialScale: 1,
};

// Metadata SEO optimizada con PWA
export const metadata: Metadata = {
  ...generateBaseMetadata(),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'meskeIA',
  },
  applicationName: 'meskeIA',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          storageKey="meskeia-theme"
        >
          <ServiceWorkerRegister />
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
