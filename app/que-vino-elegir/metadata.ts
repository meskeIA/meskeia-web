import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Qué vino elegir? Asistente situacional de vinos | meskeIA',
  description: 'Asistente para elegir el vino adecuado según tu situación: cena, regalo, restaurante, ocasión especial. Recomendaciones por plato, comensales y presupuesto. Incluye uvas LATAM.',
  keywords: 'qué vino elegir, recomendador vino, maridaje vino, vino para cena, vino regalo, qué vino pedir restaurante, simulador vino, asistente vino, vino para carne, vino para pescado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué vino elegir? | meskeIA',
    description: 'Asistente situacional de vinos: te ayuda a decidir según plato, ocasión, regalo o restaurante. Recomendaciones razonadas con alternativas.',
    url: 'https://meskeia.com/que-vino-elegir',
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
    title: '¿Qué vino elegir? | meskeIA',
    description: 'Asistente situacional de vinos: cena, regalo, restaurante u ocasión. Recomendaciones razonadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Qué vino elegir meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: '¿Qué vino elegir?',
  description: 'Asistente situacional para elegir el vino adecuado según el contexto: cena con plato concreto, regalo, restaurante, ocasión especial o exploración. Devuelve 3 recomendaciones razonadas más una alternativa para salir de la zona de confort. Cobertura amplia: tintos, blancos, espumosos y generosos del mundo, incluyendo varietales LATAM (Malbec, Torrontés, Carménère).',
  url: 'https://meskeia.com/que-vino-elegir/',
  category: 'EducationalApplication',
  features: [
    'Asistente situacional: 5 escenarios (cena, regalo, restaurante, ocasión, probar)',
    'Recomendaciones razonadas con porcentaje de afinidad',
    'Cobertura amplia: tintos, blancos, espumosos y generosos del mundo',
    'Uvas LATAM incluidas: Malbec, Torrontés, Carménère, País',
    'Alternativa "fuera de zona de confort" para explorar',
    'Tips de servicio: temperatura y maridaje',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
