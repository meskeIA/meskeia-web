import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sudoku - Juego de Lógica y Números | meskeIA',
  description: 'Juega Sudoku online gratis. 3 niveles de dificultad, validación automática, pistas y guardado de progreso. Entrena tu mente con este clásico puzzle.',
  keywords: 'sudoku, juego, puzzle, números, lógica, gratis, online, niveles, dificultad, pistas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sudoku - Juego de Lógica y Números | meskeIA',
    description: 'Sudoku online con 3 niveles de dificultad. Entrena tu mente.',
    url: 'https://meskeia.com/juego-sudoku/',
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
    title: 'Sudoku - meskeIA',
    description: 'El clásico puzzle de números, gratis y online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Sudoku",
  description: "Juega Sudoku online gratis. 3 niveles de dificultad, validación automática, pistas y guardado de progreso. Entrena tu mente con este clásico puzzle.",
  url: "https://meskeia.com/juego-sudoku/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Sudoku y cuáles son sus reglas básicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sudoku es un puzzle numérico que se juega en una cuadrícula de 9×9 dividida en nueve bloques de 3×3. El objetivo es rellenar todas las celdas vacías con dígitos del 1 al 9 de modo que cada fila, cada columna y cada bloque de 3×3 contenga cada número exactamente una vez. No se requieren conocimientos matemáticos, solo lógica y observación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos niveles de dificultad tiene el Sudoku online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este juego ofrece 3 niveles de dificultad: fácil, medio y difícil. El nivel fácil revela más números iniciales para guiar al jugador novato, mientras que el difícil proporciona muy pocos números de partida, exigiendo técnicas de deducción más avanzadas como la eliminación cruzada o el análisis de cadenas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es recomendable jugar al Sudoku habitualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sudoku es adecuado para cualquier persona a partir de los 10-12 años que quiera ejercitar la concentración y el razonamiento lógico. Estudios de neurociencia cognitiva sugieren que los puzzles de lógica pueden contribuir a mantener activas las funciones ejecutivas del cerebro. Es especialmente popular entre personas mayores como actividad de estimulación cognitiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el Sudoku clásico y otras variantes como el Killer Sudoku?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sudoku clásico solo requiere que cada número aparezca una vez por fila, columna y bloque. El Killer Sudoku añade "jaulas" con una suma objetivo: los números de cada jaula deben sumar exactamente ese valor además de cumplir las reglas estándar. Otras variantes populares incluyen el Sudoku X (diagonales), el Hyper Sudoku (bloques extra) o el Samurai Sudoku (cinco cuadrículas solapadas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos Sudokus distintos existen matemáticamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existe un número astronómico de cuadrículas de Sudoku válidas: aproximadamente 6,67 × 10²¹ soluciones completas distintas. Teniendo en cuenta simetrías y transformaciones equivalentes, hay alrededor de 5.472.730.538 cuadrículas esencialmente diferentes. En la práctica, esto garantiza que un generador automatizado nunca agote los puzzles posibles.',
      },
    },
  ],
};
