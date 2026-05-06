import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Seguimiento de Hábitos - Construye rutinas saludables | meskeIA',
  description: 'Crea y sigue tus hábitos diarios con calendario visual, rachas, estadísticas detalladas y sistema de logros. Herramienta gratuita para construir rutinas saludables.',
  keywords: 'seguimiento hábitos, tracker hábitos, rutinas diarias, rachas, productividad, bienestar, hábitos saludables, calendario hábitos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Seguimiento de Hábitos - meskeIA',
    description: 'Crea y sigue tus hábitos diarios con calendario visual, rachas y sistema de logros',
    url: 'https://meskeia.com/seguimiento-habitos',
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
    title: 'Seguimiento de Hábitos - meskeIA',
    description: 'Construye rutinas saludables con visualización de rachas y logros',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Seguimiento de Hábitos - Construye rutinas saludables",
  description: "Crea y sigue tus hábitos diarios con calendario visual, rachas, estadísticas detalladas y sistema de logros. Herramienta gratuita para construir rutinas saludables.",
  url: 'https://meskeia.com/seguimiento-habitos/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
