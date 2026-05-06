import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Piscinas - Cloro, pH, Alguicida y Volumen | meskeIA',
  description: 'Calcula el volumen de tu piscina y las dosis de productos químicos: cloro, corrector de pH, alguicida y sal. Para mantenimiento regular y tratamiento de choque. Gratis.',
  keywords: 'calculadora piscina, cuanto cloro piscina, volumen piscina, dosis alguicida, corrector ph piscina, tratamiento quimico piscina, mantenimiento piscina, piscina sal cloracion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Piscinas - Productos Químicos y Volumen | meskeIA',
    description: 'Calcula el volumen de tu piscina y las dosis exactas de cloro, pH y alguicida.',
    url: 'https://meskeia.com/calculadora-piscinas',
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
    title: 'Calculadora de Piscinas | meskeIA',
    description: 'Calcula cuánto cloro, alguicida y corrector de pH necesita tu piscina según su volumen.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Piscinas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Piscinas',
  description: 'Herramienta gratuita para calcular el volumen de una piscina (rectangular, circular u ovalada) y las dosis de productos químicos necesarios: cloro granulado o líquido, corrector de pH, alguicida y sal para sistemas de cloración salina.',
  url: 'https://meskeia.com/calculadora-piscinas/',
  features: [
    'Cálculo de volumen para piscinas rectangulares, circulares y ovaladas',
    'Dosis de cloro granulado y líquido (mantenimiento y choque)',
    'Dosis de corrector de pH (elevador y reductor)',
    'Dosis de alguicida preventivo y de choque',
    'Dosis de sal para piscinas con electrólisis salina',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
