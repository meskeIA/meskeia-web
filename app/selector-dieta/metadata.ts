import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Dieta — ¿Qué alimentación te conviene? | meskeIA',
  description: 'Test de 10 preguntas para descubrir qué patrón alimentario se adapta mejor a tus objetivos, estilo de vida, salud y restricciones. Mediterránea, vegana, cetogénica, DASH y más.',
  keywords: [
    'qué dieta seguir',
    'selector dieta',
    'test tipo de dieta',
    'mediterránea o cetogénica',
    'dieta para mi estilo de vida',
    'qué alimentación elegir',
    'dieta saludable España',
    'dieta para perder peso',
    'patrón alimentario recomendado',
    'mejor dieta para mí',
  ],
  openGraph: {
    title: '¿Qué dieta te conviene? Test en 10 preguntas | meskeIA',
    description: 'Más allá de las modas, descubre el patrón alimentario que realmente encaja con tu vida. Objetivos, salud, tiempo y restricciones en 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-dieta/',
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
    title: '¿Qué dieta te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para encontrar el patrón alimentario más adecuado para tus objetivos, salud y estilo de vida.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-dieta/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Dieta',
      description: 'Test orientativo para descubrir qué patrón alimentario (mediterránea, vegetariana, vegana, cetogénica, DASH, ayuno intermitente) se adapta mejor al perfil, objetivos y estilo de vida del usuario.',
      url: 'https://meskeia.com/selector-dieta/',
      features: [
        'Test de 10 preguntas sobre objetivos y estilo de vida',
        '6 patrones alimentarios analizados',
        'Consideración de condiciones de salud',
        'Análisis de restricciones alimentarias',
        'Consejos prácticos de transición',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};
