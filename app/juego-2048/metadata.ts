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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se juega al 2048?',
      acceptedAnswer: { '@type': 'Answer', text: 'Se desliza el tablero en cuatro direcciones (arriba, abajo, izquierda, derecha) y las fichas con el mismo número se combinan sumándose. El objetivo es alcanzar una ficha con el valor 2048. Cada movimiento añade una nueva ficha de valor 2 o 4 en una casilla vacía.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la estrategia más efectiva para llegar a 2048?',
      acceptedAnswer: { '@type': 'Answer', text: 'La estrategia más reconocida es mantener la ficha de mayor valor en una esquina y construir una cadena decreciente de fichas a lo largo de los bordes, evitando deslizar en la dirección contraria a esa esquina. Esto maximiza las fusiones y libera espacio en el centro del tablero.' },
    },
    {
      '@type': 'Question',
      name: '¿Es posible seguir jugando después de alcanzar 2048?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Al llegar a 2048 el juego permite continuar para alcanzar valores aún más altos: 4096, 8192 o incluso 16384. La partida termina únicamente cuando el tablero 4×4 está completamente lleno y no hay ningún movimiento posible.' },
    },
    {
      '@type': 'Question',
      name: '¿Quién creó el juego 2048?',
      acceptedAnswer: { '@type': 'Answer', text: 'El juego original fue creado por Gabriele Cirulli, un desarrollador italiano, y publicado en marzo de 2014. Se viralizó en pocas semanas alcanzando millones de partidas diarias. Está inspirado en juegos previos como Threes! (2014) y 1024, aunque Cirulli lo desarrolló de forma independiente.' },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve jugar al 2048?',
      acceptedAnswer: { '@type': 'Answer', text: 'Además del entretenimiento, el 2048 ejercita el pensamiento estratégico, la planificación a varios movimientos vista y el reconocimiento de patrones. Algunos docentes lo usan para motivar el aprendizaje de potencias de 2 y aritmética mental de forma lúdica.' },
    },
  ],
};
