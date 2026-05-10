import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Qué cerveza elegir? Asistente situacional de cervezas | meskeIA',
  description: 'Asistente para elegir la cerveza adecuada según tu situación: comida, regalo, bar, ocasión especial. Recomendaciones por plato, ocasión y presupuesto. Estilos del mundo: IPA, Stout, Pilsner, NEIPA, Quadrupel.',
  keywords: 'qué cerveza elegir, recomendador cerveza, maridaje cerveza, cerveza para comida, cerveza regalo, cerveza craft, simulador cerveza, asistente cerveza, IPA, NEIPA, stout, pilsner',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué cerveza elegir? | meskeIA',
    description: 'Asistente situacional de cervezas: te ayuda a decidir según comida, ocasión, regalo o exploración. Recomendaciones razonadas con alternativas.',
    url: 'https://meskeia.com/que-cerveza-elegir/',
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
    title: '¿Qué cerveza elegir? | meskeIA',
    description: 'Asistente situacional de cervezas: comida, regalo, bar u ocasión. Recomendaciones razonadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Qué cerveza elegir meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: '¿Qué cerveza elegir?',
  description: 'Asistente situacional para elegir la cerveza adecuada según el contexto: comida con plato concreto, regalo, bar/restaurante, ocasión especial o exploración. Devuelve 3 recomendaciones razonadas más una alternativa para salir de la zona de confort. Cobertura amplia: estilos clásicos europeos, craft americano (NEIPA, Double IPA), trapenses (Tripel, Quadrupel) y Mexican Lager.',
  url: 'https://meskeia.com/que-cerveza-elegir/',
  category: 'EducationalApplication',
  features: [
    'Asistente situacional: 5 escenarios (comida, regalo, bar, ocasión, probar)',
    'Recomendaciones razonadas con porcentaje de afinidad',
    'Cobertura craft moderna: NEIPA, Double IPA, Belgian Strong Golden Ale',
    'Estilos trapenses: Tripel, Dubbel, Quadrupel',
    'Mexican Lager y estilos no europeos incluidos',
    'Alternativa "fuera de zona de confort" para explorar',
    'Tips de servicio: temperatura y maridaje',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
