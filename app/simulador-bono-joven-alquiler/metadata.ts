import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad | meskeIA',
  description:
    'Comprueba si cumples los requisitos del Bono Joven Alquiler: 18-35 años, ingresos ≤ 3× IPREM. Calcula cuánto puedes ahorrar: hasta €250/mes durante 2 años (€6.000 total).',
  keywords:
    'bono joven alquiler, ayuda alquiler joven, requisitos bono alquiler joven, 250 euros alquiler joven, elegibilidad bono alquiler, plan vivienda jóvenes, subsidio alquiler joven españa 2026',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad',
    description:
      '¿Tienes entre 18 y 35 años? Comprueba si cumples los requisitos del Bono Alquiler Joven y cuánto puedes ahorrar.',
    url: 'https://meskeia.com/simulador-bono-joven-alquiler/',
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
    title: 'Simulador Bono Joven Alquiler',
    description:
      'Comprueba si tienes derecho al Bono Alquiler Joven: €250/mes durante 2 años. Orientador rápido y gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Bono Joven Alquiler",
  description: "Comprueba si cumples los requisitos del Bono Joven Alquiler: 18-35 años, ingresos ≤ 3× IPREM. Calcula cuánto puedes ahorrar: hasta €250/mes durante 2 años (€6.000 total).",
  url: "https://meskeia.com/simulador-bono-joven-alquiler/",
  category: 'FinanceApplication',
  features: [],
});
