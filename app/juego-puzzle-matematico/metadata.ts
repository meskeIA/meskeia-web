import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Puzzle Matemático - Juego de Operaciones | meskeIA',
  description: 'Resuelve puzzles matemáticos contrarreloj. Suma, resta, multiplicación y división con niveles progresivos. Entrena tu agilidad mental.',
  keywords: 'puzzle, matemático, juego, operaciones, suma, resta, multiplicación, división, mental, matemáticas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Puzzle Matemático - Juego de Operaciones | meskeIA',
    description: 'Resuelve operaciones matemáticas contrarreloj. Entrena tu mente.',
    url: 'https://meskeia.com/juego-puzzle-matematico/',
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
    title: 'Puzzle Matemático - meskeIA',
    description: 'Desafía tu agilidad mental con operaciones matemáticas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego Puzzle Matemático",
  description: "Resuelve puzzles matemáticos contrarreloj. Suma, resta, multiplicación y división con niveles progresivos. Entrena tu agilidad mental.",
  url: "https://meskeia.com/juego-puzzle-matematico/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un puzzle matemático y cómo funciona este juego?',
      acceptedAnswer: { '@type': 'Answer', text: 'Un puzzle matemático es un desafío numérico que combina operaciones aritméticas (suma, resta, multiplicación y división) para entrenar la agilidad mental. En este juego aparecen operaciones contrarreloj con niveles de dificultad progresivos: cuantas más respuestas correctas encadenes, más exigentes se vuelven los cálculos.' },
    },
    {
      '@type': 'Question',
      name: '¿Para qué edad son adecuados estos puzzles matemáticos?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los puzzles matemáticos están diseñados para jugadores a partir de 8 años, aunque los niveles avanzados son más adecuados para adolescentes y adultos. Son especialmente útiles para estudiantes de primaria y secundaria que quieren practicar el cálculo mental de forma entretenida y sin presión académica.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué beneficios tiene practicar cálculo mental con juegos de operaciones?',
      acceptedAnswer: { '@type': 'Answer', text: 'El cálculo mental regular mejora la velocidad de procesamiento numérico, la memoria de trabajo y la concentración. Estudios en educación matemática muestran que practicar operaciones aritméticas de forma fluida reduce la carga cognitiva al resolver problemas más complejos, dejando más recursos mentales disponibles para el razonamiento abstracto.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo al día se recomienda practicar para notar mejora?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sesiones cortas de 5 a 15 minutos diarios son más efectivas que sesiones largas esporádicas. La práctica distribuida favorece la automatización de los hechos numéricos básicos. Después de 2 a 4 semanas de práctica constante suele notarse una mejora visible en la velocidad de cálculo.' },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este juego de otras apps de matemáticas?',
      acceptedAnswer: { '@type': 'Answer', text: 'A diferencia de apps con registro obligatorio o compras dentro del juego, este juego funciona directamente en el navegador sin instalación ni cuenta. Los niveles se adaptan automáticamente al rendimiento del jugador, y la mecánica contrarreloj añade un elemento de dinamismo que hace el entrenamiento más estimulante que los ejercicios estáticos en papel.' },
    },
  ],
};
