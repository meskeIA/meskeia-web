import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Wordle en Español - Adivina la Palabra | meskeIA',
  description: 'Juega al Wordle en español. Adivina la palabra de 5 letras en 6 intentos. Nueva palabra cada día. Gratis y sin registro.',
  keywords: 'wordle, español, palabra, adivinar, juego, letras, diario, puzzle, vocabulario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Wordle en Español - Adivina la Palabra | meskeIA',
    description: 'Adivina la palabra de 5 letras en 6 intentos.',
    url: 'https://meskeia.com/juego-wordle/',
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
    title: 'Wordle en Español - meskeIA',
    description: 'El juego de palabras más popular, en español.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Wordle en Español - Adivina la Palabra",
  description: "Juega al Wordle en español. Adivina la palabra de 5 letras en 6 intentos. Nueva palabra cada día. Gratis y sin registro.",
  url: 'https://meskeia.com/juego-wordle/',
  category: 'EducationalApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Wordle y cómo se juega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Wordle es un juego de palabras en el que debes adivinar una palabra secreta de 5 letras en un máximo de 6 intentos. Tras cada intento, las letras se colorean: verde si están en la posición correcta, amarillo si están en la palabra pero en otra posición, y gris si no pertenecen a la palabra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto tiempo cambia la palabra en el Wordle?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La palabra cambia cada día a medianoche. Todos los jugadores del mismo día deben adivinar la misma palabra, lo que permite comparar resultados con amigos y compartir puntuaciones en redes sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil el Wordle en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Wordle en español es ideal para cualquier persona que quiera ejercitar su vocabulario y agilidad mental de forma entretenida. Es especialmente recomendado para estudiantes de español como lengua extranjera, personas que quieren ampliar su léxico y aficionados a los juegos de palabras y los puzzles lingüísticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras distintas puede llegar a tener el Wordle en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El español dispone de miles de palabras comunes de 5 letras, lo que garantiza variedad durante años de juego diario. La selección de palabras suele evitar términos demasiado técnicos o poco frecuentes, priorizando aquellas que un hablante adulto reconocería con facilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Wordle en español y la versión original en inglés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mecánica es idéntica: 5 letras, 6 intentos y una nueva palabra cada día. La diferencia es que el diccionario y las palabras propuestas están en español, incluyendo caracteres propios del idioma como la ñ o vocales con tilde, lo que añade un reto lingüístico adicional frente a la versión inglesa.',
      },
    },
  ],
};
