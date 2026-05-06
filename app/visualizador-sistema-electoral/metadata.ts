import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Elección - Ley D\'Hondt y Sistemas Electorales | meskeIA',
  description: 'Entiende cómo se reparten los escaños en España: ley D\'Hondt paso a paso, sistemas proporcional vs mayoritario, el efecto de las circunscripciones. Explicador visual interactivo.',
  keywords: 'sistema electoral, ley dhondt, elecciones españa, proporcional, mayoritario, circunscripciones, escaños, congreso diputados, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Elección — Sistemas Electorales Explicados',
    description: 'Ley D\'Hondt, sistemas proporcional y mayoritario, circunscripciones: cómo los votos se convierten en escaños.',
    url: 'https://meskeia.com/visualizador-sistema-electoral',
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
    title: 'Cómo Funciona una Elección — Sistemas Electorales Explicados',
    description: 'Ley D\'Hondt paso a paso, sistemas electorales comparados y el efecto de las circunscripciones en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Electoral meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Elección',
  description: 'Explicador visual interactivo sobre sistemas electorales: cómo se emiten los votos, la ley D\'Hondt paso a paso, comparación entre sistemas proporcional, mayoritario y mixto, y el efecto de las circunscripciones en España.',
  url: 'https://meskeia.com/visualizador-sistema-electoral/',
  features: [
    'Ley D\'Hondt explicada paso a paso con ejemplo real',
    'Comparación visual: proporcional vs mayoritario vs mixto',
    'Mismo resultado de votos, distintos repartos de escaños',
    'Mapa de circunscripciones y el "bonus rural"',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
