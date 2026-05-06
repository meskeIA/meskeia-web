import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Convertidor de Colores - HEX, RGB, HSL, CMYK | meskeIA',
  description: 'Convierte colores entre HEX, RGB, HSL y CMYK al instante. Color picker visual, paletas automáticas y análisis de color para diseñadores web.',
  keywords: 'convertidor colores, HEX RGB, RGB HSL, color picker, CMYK, conversión colores, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Convertidor de Colores - meskeIA',
    description: 'Convierte colores entre HEX, RGB, HSL y CMYK al instante',
    url: 'https://meskeia.com/conversor-colores/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Convertidor de Colores - HEX, RGB, HSL, CMYK",
  description: "Convierte colores entre HEX, RGB, HSL y CMYK al instante. Color picker visual, paletas automáticas y análisis de color para diseñadores web.",
  url: 'https://meskeia.com/conversor-colores/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
