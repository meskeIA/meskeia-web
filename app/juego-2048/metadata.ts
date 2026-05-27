import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '2048 - Juego de Números | meskeIA',
  description: 'Juega al clásico 2048 en español. Desliza y combina fichas para alcanzar la suma de 2048. Modo oscuro, puntuación guardada y estadísticas de partida. Gratis.',
  keywords: '2048, juego, numeros, puzzle, estrategia, combinar, deslizar, online, gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '2048 - Juego de Números | meskeIA',
    description: 'Desliza y combina números para llegar a 2048.',
    url: 'https://meskeia.com/juego-2048/',
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
    title: '2048 - meskeIA',
    description: 'El clásico juego de números.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego 2048",
  description: "Juega al clásico 2048 en español. Desliza y combina fichas para alcanzar la suma de 2048. Modo oscuro, puntuación guardada y estadísticas de partida. Gratis.",
  url: "https://meskeia.com/juego-2048/",
  category: 'UtilityApplication',
  features: [],
});
