import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { generateBaseMetadata } from '@/lib/metadata';
import { ThemeProvider } from '@/components/ThemeProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import DynamicThemeColor from '@/components/DynamicThemeColor';
import ErrorBoundary from '@/components/ErrorBoundary';
import RecentAppTracker from '@/components/RecentAppTracker';
import TransparencyBanner from '@/components/TransparencyBanner';
import { Providers } from './providers';
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
  verification: {
    google: '2Ytijr-l5aJo-wEh4UwcIvnrBDbIqOD8d9_PKF2UcJw',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'meskeIA',
  },
  applicationName: 'meskeIA',
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/icon_meskeia.png' },
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
      <head>
        {/*
          Marca por host: bajo un dominio vertical marcamos <html data-brand="…">
          antes del primer paint para que globals.css reviuta la app con la paleta
          de la marca sin flash. stemum.com → violeta; coquinum.com → verde oliva.
          En meskeia.com no hace nada. Patrón equivalente al script de tema de
          next-themes.
        */}
        <script>
          {`(function(){try{var h=location.hostname;if(h==='stemum.com'||h==='www.stemum.com'){document.documentElement.setAttribute('data-brand','stemum');}else if(h==='coquinum.com'||h==='www.coquinum.com'){document.documentElement.setAttribute('data-brand','coquinum');}}catch(e){}})();`}
        </script>
        {/* Preconnect para optimizar carga de fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          El JSON-LD WebSite/SearchAction de meskeIA se inyecta solo en la home (app/page.tsx),
          que es donde Google espera el sitelinks searchbox. No va en el layout raíz para no
          contaminar subsitios con marca propia (p.ej. /delegum) ni el resto de páginas internas.
        */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem={false}
            storageKey="meskeia-theme"
            disableTransitionOnChange={false}
          >
            <ErrorBoundary>
              <DynamicThemeColor />
              <ServiceWorkerRegister />
              <RecentAppTracker />
              {children}
              <TransparencyBanner />
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
