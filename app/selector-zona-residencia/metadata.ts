import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Zona de Residencia — ¿Ciudad, pueblo o costa? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de zona de residencia se adapta mejor a tu estilo de vida: ciudad grande, ciudad media, pueblo o zona rural, o costa. Análisis según trabajo, familia, presupuesto y preferencias.',
  keywords: [
    'vivir en ciudad o pueblo',
    'mudarse a la costa',
    'ciudad grande o pequeña',
    'zona rural o urbana España',
    'dónde vivir mejor España',
    'mudarse al pueblo desde ciudad',
    'teletrabajo y dónde vivir',
    'calidad de vida ciudad vs pueblo',
    'vivir cerca de la naturaleza',
    'precio vivienda ciudad vs pueblo',
  ],
  openGraph: {
    title: '¿Ciudad, pueblo o costa? Test de zona de residencia | meskeIA',
    description:
      'Descubre qué tipo de entorno se adapta mejor a tu trabajo, familia y estilo de vida con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-zona-residencia/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Dónde vivir? Test de zona de residencia | meskeIA',
    description:
      'Test de 10 preguntas para saber si te conviene más la ciudad, un pueblo o la costa según tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-zona-residencia/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Zona de Residencia',
        description:
          'Test orientativo para descubrir qué tipo de entorno (ciudad grande, ciudad media, pueblo/rural o costa) se adapta mejor al estilo de vida, trabajo y familia.',
        url: 'https://meskeia.com/selector-zona-residencia/',
        features: [
          'Test de 10 preguntas sobre estilo de vida',
          '4 recomendaciones: ciudad grande, ciudad media, pueblo/rural, costa',
          'Análisis de trabajo, transporte, familia y ocio',
          'Orientación sobre coste de vida por tipo de zona',
          'Consideración del teletrabajo y la conectividad',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Zona de Residencia",
  description: "Test de 10 preguntas para saber qué tipo de zona de residencia se adapta mejor a tu estilo de vida: ciudad grande, ciudad media, pueblo o zona rural, o costa. Análisis según trabajo, familia, presupue",
  url: "https://meskeia.com/selector-zona-residencia/",
  category: 'FinanceApplication',
  features: [],
});
