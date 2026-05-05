import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Tipos de Pasta Italiana | meskeIA',
  description:
    'Guía de referencia de 40 tipos de pasta: spaghetti, penne, fusilli, ravioli y más. Forma, región, tiempo de cocción y salsa ideal.',
  keywords: [
    'tipos de pasta',
    'pasta italiana',
    'spaghetti penne fusilli',
    'ravioli tortellini',
    'salsa pasta',
    'cocinar pasta',
    'regiones italia',
  ],
  openGraph: {
    title: 'Guía de Tipos de Pasta Italiana',
    description:
      'Descubre 40 tipos de pasta italiana: forma, región, tiempo de cocción y salsa ideal. La guía definitiva para cocinar pasta.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Tipos de Pasta Italiana',
    description:
      'Descubre 40 tipos de pasta italiana: forma, región, tiempo de cocción y salsa ideal.',
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-tipos-pasta',
  },
  robots: {
    index: true,
    follow: true,
  },
};
