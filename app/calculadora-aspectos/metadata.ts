import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Aspectos de Imagen - Mantén Proporciones | meskeIA',
  description: 'Calcula proporciones perfectas para redimensionar imágenes sin deformarlas. Presets para Instagram, YouTube, Facebook y más redes sociales.',
  keywords: 'calculadora aspectos, ratio imagen, redimensionar, proporciones, 16:9, 4:3, instagram, youtube, aspect ratio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Aspectos de Imagen - meskeIA',
    description: 'Redimensiona imágenes manteniendo proporciones perfectas',
    url: 'https://meskeia.com/calculadora-aspectos/',
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
  name: "Calculadora de Aspectos de Imagen - Mantén Proporciones",
  description: "Calcula proporciones perfectas para redimensionar imágenes sin deformarlas. Presets para Instagram, YouTube, Facebook y más redes sociales.",
  url: 'https://meskeia.com/calculadora-aspectos/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
