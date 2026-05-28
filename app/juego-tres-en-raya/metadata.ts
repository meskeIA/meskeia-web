import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tres en Raya - Juego Clásico Online | meskeIA',
  description: 'Juega al clásico Tres en Raya (Tic Tac Toe) online contra la computadora. Elige entre 3 niveles de dificultad: fácil, medio y difícil. Gratis y sin registro.',
  keywords: 'tres en raya, tic tac toe, juego, clasico, online, gratis, computadora, estrategia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tres en Raya - Juego Clásico | meskeIA',
    description: 'Juega al clásico Tres en Raya contra la computadora.',
    url: 'https://meskeia.com/juego-tres-en-raya/',
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
    title: 'Tres en Raya - meskeIA',
    description: 'Juego clásico contra la computadora.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Tres en Raya",
  description: "Juega al clásico Tres en Raya (Tic Tac Toe) online contra la computadora. Elige entre 3 niveles de dificultad: fácil, medio y difícil. Gratis y sin registro.",
  url: "https://meskeia.com/juego-tres-en-raya/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Tres en Raya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Tres en Raya (también conocido como Tic Tac Toe) es un juego de estrategia para dos jugadores en un tablero de 3×3 casillas. Cada jugador elige X u O y deben colocar tres fichas en línea —horizontal, vertical o diagonal— antes que el contrario. Es uno de los juegos de mesa más antiguos del mundo y una excelente introducción al pensamiento estratégico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la dificultad de la computadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El juego ofrece tres niveles: fácil, medio y difícil. En nivel difícil, la computadora usa el algoritmo minimax, que evalúa todos los movimientos posibles para elegir siempre la jugada óptima. Esto significa que en nivel difícil es matemáticamente imposible ganarle si juega perfectamente; el mejor resultado posible es el empate.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede ganar siempre al Tres en Raya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El Tres en Raya es un juego con resultado forzado: si ambos jugadores juegan de forma óptima, el resultado siempre es empate. El primer jugador que coloca en el centro tiene ventaja, pero no es suficiente para garantizar la victoria. Por eso es un juego ideal para aprender los fundamentos del pensamiento estratégico antes de pasar a juegos más complejos como el ajedrez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué edad es adecuado el Tres en Raya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Tres en Raya es adecuado a partir de los 5-6 años, cuando los niños empiezan a comprender conceptos de líneas y turnos. Es ampliamente utilizado en educación primaria para desarrollar el pensamiento lógico, la planificación y la toma de decisiones. También resulta entretenido para adultos como pasatiempo rápido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Tres en Raya y otros juegos de alineación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Tres en Raya usa un tablero de 3×3 y gana quien alinee 3 fichas. Variantes como el "Conecta 4" usan tablero 6×7 y requieren alinear 4 fichas, añadiendo mucha más complejidad estratégica. El "Gomoku" o "cinco en raya" se juega en tablero 15×15. La versión clásica 3×3 es la más sencilla y está completamente "resuelta" matemáticamente desde hace décadas.',
      },
    },
  ],
};
