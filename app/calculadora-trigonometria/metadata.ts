import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Trigonometría - Seno, Coseno, Tangente | meskeIA',
  description: 'Calcula funciones trigonométricas, resuelve triángulos, convierte ángulos y aplica identidades. Herramienta completa de trigonometría.',
  keywords: 'trigonometría, seno, coseno, tangente, ángulos, radianes, grados, triángulos, identidades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Trigonometría | meskeIA',
    description: 'Funciones trigonométricas, resolución de triángulos y conversión de ángulos.',
    url: 'https://meskeia.com/calculadora-trigonometria/',
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
    title: 'Calculadora de Trigonometría | meskeIA',
    description: 'Herramienta de trigonometría completa online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Trigonometría - Seno, Coseno, Tangente",
  description: "Calcula funciones trigonométricas, resuelve triángulos, convierte ángulos y aplica identidades. Herramienta completa de trigonometría.",
  url: 'https://meskeia.com/calculadora-trigonometria/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
