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
  features: [
    '85 elementos de la tabla periódica',
    '2 modos: símbolo → nombre y nombre → símbolo',
    '3 niveles de dificultad: fácil (10 preguntas), medio (15) y difícil (20)',
    'Feedback inmediato con nombre, símbolo y número atómico',
    'Racha de aciertos y resumen de errores al final',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué los símbolos químicos no siempre coinciden con el nombre del elemento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muchos símbolos provienen del nombre latino o griego del elemento, establecidos antes de que se estandarizara la nomenclatura moderna. Por ejemplo, el oro (Au) viene del latín "aurum", la plata (Ag) de "argentum", el hierro (Fe) de "ferrum" y el mercurio (Hg) de "hydrargyrum". La IUPAC mantiene estos símbolos históricos por tradición y universalidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos elementos tiene la tabla periódica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tabla periódica actual tiene 118 elementos confirmados, del hidrógeno (H, número atómico 1) al oganesón (Og, número atómico 118). Los elementos del 1 al 94 se encuentran en la naturaleza; los elementos del 95 al 118 son sintéticos, producidos en reactores o aceleradores de partículas y tienen vidas medias muy cortas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la manera más eficaz de memorizar los símbolos químicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La práctica repetida mediante quizzes de respuesta activa (recordar el símbolo sin pistas) es más eficaz que releer listas pasivamente. Ayuda agrupar los elementos por familias (metales alcalinos, halógenos, gases nobles) y usar reglas mnemotécnicas para los casos irregulares (Au, Ag, Fe, Cu, Pb, Hg). Comenzar con los 20 elementos más frecuentes en problemas de bachillerato y ampliar progresivamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este quiz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz es adecuado desde el primer contacto con la química en educación secundaria hasta bachillerato o primer año universitario. El modo fácil (elementos del primer y segundo período) es ideal para estudiantes de 12-14 años; el modo difícil, con elementos de tierras raras y metales de transición, supone un reto incluso para estudiantes universitarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre símbolo, número atómico y masa atómica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El símbolo es la abreviatura de una o dos letras que identifica al elemento (p. ej. Na para sodio). El número atómico (Z) indica cuántos protones tiene el núcleo y define de qué elemento se trata; es único para cada elemento. La masa atómica (u) es el promedio ponderado de las masas de todos los isótopos naturales del elemento, expresado en unidades de masa atómica.',
      },
    },
  ],
};
