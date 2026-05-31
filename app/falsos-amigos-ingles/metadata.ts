import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Falsos Amigos Español-Inglés: Catálogo y Práctica - meskeIA',
  description: '75 falsos amigos español-inglés con significado real y práctica interactiva. Embarassed ≠ embarazada, actually ≠ actualmente, library ≠ librería. Búsqueda y modo flashcard.',
  keywords: 'falsos amigos inglés español, false friends Spanish English, palabras parecidas inglés español significado diferente, embarassed embarazada, actually actualmente, library librería, vocabulary English Spanish',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Falsos Amigos Español-Inglés — 75 pares con búsqueda y práctica interactiva',
    description: '¿Sabías que "embarassed" no significa "embarazada"? Descubre los 75 falsos amigos más frecuentes y practica con el modo flashcard.',
    url: 'https://meskeia.com/falsos-amigos-ingles/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Falsos Amigos Español-Inglés — 75 pares + práctica interactiva',
    description: '"Library" no es librería. "Carpet" no es carpeta. Aprende los 75 falsos amigos más frecuentes.',
  },
  other: {
    'application-name': 'Falsos Amigos Español-Inglés - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Falsos Amigos Español-Inglés: Catálogo y Práctica',
  description: 'Herramienta bilingüe para hispanohablantes que aprenden inglés: 75 falsos amigos (false friends) con su significado real, el error frecuente y ejemplos de uso. Incluye buscador, filtros por categoría y nivel, y modo de práctica tipo flashcard con puntuación.',
  url: 'https://meskeia.com/falsos-amigos-ingles/',
  category: 'EducationalApplication',
  features: [
    '75 falsos amigos español-inglés curados y verificados',
    'Pestaña Catálogo: búsqueda en tiempo real + filtros por categoría y nivel',
    'Pestaña Práctica: modo flashcard con 3 opciones y puntuación final',
    'Cada par incluye significado real, error frecuente y ejemplo de uso',
    'Niveles básico, medio y avanzado para aprendizaje progresivo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los falsos amigos en inglés y español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los falsos amigos (false friends) son palabras que se parecen mucho en inglés y español pero tienen significados distintos. Por ejemplo, "embarrassed" (avergonzado) ≠ "embarazada" (pregnant), o "library" (biblioteca) ≠ "librería" (bookstore). Son una de las fuentes de error más frecuentes para hispanohablantes que aprenden inglés.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los falsos amigos más frecuentes entre español e inglés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los más comunes incluyen: embarrassed/embarazada, actually/actualmente, library/librería, carpet/carpeta, constipated/constipado, soap/sopa, large/largo, exit/éxito, sensible/sensible, y realize/realizar. Esta herramienta reúne 75 de los pares más frecuentes y peligrosos organizados por nivel de dificultad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué "actually" no significa "actualmente"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"Actually" en inglés significa "en realidad" o "de hecho" (correctivo o enfático). "Actualmente" en español se traduce al inglés como "currently" o "nowadays". Es uno de los falsos amigos más usados y más fuente de malentendidos: "Actually, I disagree" = "En realidad, no estoy de acuerdo", no "actualmente".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el modo práctica de falsos amigos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la pestaña Práctica, aparece una palabra en inglés y tres opciones en español: el significado real, el error frecuente (el falso amigo) y un distractor. Al elegir, se muestra si es correcto y la explicación completa. Al finalizar los 20 ejercicios obtienes tu puntuación y puedes repetir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿"Sensible" en inglés es lo mismo que "sensible" en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. "Sensible" en inglés significa "razonable", "sensato" o "prudente" ("That\'s a sensible decision" = "Es una decisión sensata"). "Sensible" en español se traduce al inglés como "sensitive" (emotivamente sensible). Es uno de los falsos amigos más confundidos en conversaciones formales.',
      },
    },
  ],
};
