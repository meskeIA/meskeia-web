import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Símbolos Químicos — Aprende la Tabla Periódica | meskeIA',
  description:
    'Pon a prueba tus conocimientos de química: adivina el nombre del elemento por su símbolo o viceversa. 3 dificultades, 2 modos, 85 elementos. ¡Cuántos conoces?',
  keywords:
    'quiz símbolos químicos, tabla periódica juego, aprender química, símbolos elementos, quiz quimica, juego tabla periódica, aprender elementos quimicos, Fe Au Ag Hg',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Símbolos Químicos — Aprende la Tabla Periódica',
    description:
      'Adivina el nombre del elemento por su símbolo o el símbolo por el nombre. 3 dificultades, 2 modos, 85 elementos.',
    url: 'https://meskeia.com/quiz-simbolos-quimicos/',
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
    title: 'Quiz Símbolos Químicos — Aprende la Tabla Periódica',
    description:
      '¿Sabes qué elemento es "Au"? ¡Pon a prueba tus conocimientos de química con este quiz interactivo!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Símbolos Químicos",
  description: "Pon a prueba tus conocimientos de química: adivina el nombre del elemento por su símbolo o viceversa. 3 dificultades, 2 modos, 85 elementos. ¡Cuántos conoces?",
  url: "https://meskeia.com/quiz-simbolos-quimicos/",
  category: 'EducationalApplication',
  features: [],
});
