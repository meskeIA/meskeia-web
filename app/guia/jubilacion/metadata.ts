import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Jubilación en España — Planifica paso a paso | meskeIA',
  description: 'Guía completa para planificar tu jubilación en España: edad de jubilación, pensión estimada, brecha de ingresos, ahorro complementario, IRPF como pensionista y protección familiar. 7 herramientas gratuitas.',
  keywords: 'guia jubilacion españa, planificar jubilacion, pension publica, brecha jubilacion, ahorro jubilacion, plan pensiones, irpf pensionista, pension viudedad, cuando jubilarme',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Jubilación en España — meskeIA',
    description: 'Planifica tu jubilación paso a paso: pensión, ahorro, impuestos y protección familiar.',
    url: 'https://meskeia.com/guia/jubilacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Jubilación en España',
    description: 'Herramientas gratuitas para planificar tu jubilación paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
};
