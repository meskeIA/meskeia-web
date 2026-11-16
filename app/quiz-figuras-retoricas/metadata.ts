import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { figurasRetorica } from '@/data/figuras-retoricas';
import { PREGUNTAS_FRECUENTES } from './faq';

// Hallazgo 3646: la cifra sale del banco (decía 27 con 26 figuras)
const TOTAL = figurasRetorica.length;
const descripcion = `Aprende a identificar las figuras retóricas con este quiz interactivo. ${TOTAL} figuras (básico, bachillerato, selectividad): metáfora, hipérbole, anáfora, oxímoron y mucho más. Sin registro.`;

export const metadata: Metadata = {
  title: 'Quiz Figuras Retóricas - Identifica Metáfora, Hipérbole, Símil y más | meskeIA',
  description: descripcion,
  keywords: 'figuras retóricas, quiz figuras retóricas, metáfora hipérbole símil, recursos literarios, lengua española, selectividad lengua, bachillerato lengua, figuras literarias ejercicios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: `Identifica metáforas, hipérboles, anáforas y ${TOTAL - 3} figuras más. Quiz interactivo con ejemplos y explicaciones. Para ESO, Bachillerato y Selectividad.`,
    url: 'https://meskeia.com/quiz-figuras-retoricas/',
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
    title: 'Quiz Figuras Retóricas | meskeIA',
    description: `Aprende a identificar figuras retóricas: ${TOTAL} figuras, 3 niveles, con ejemplos y explicaciones. Sin publicidad.`,
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Figuras Retóricas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Figuras Retóricas",
  description: descripcion,
  url: "https://meskeia.com/quiz-figuras-retoricas/",
  category: 'EducationalApplication',
  // Hallazgo 3652: prometía un «historial de errores con revisión al final» que la app no tiene.
  // Ahora, lo que se ve en ella.
  features: [
    `${TOTAL} figuras retóricas en tres niveles (Básico, Intermedio, Avanzado) y modo Todas`,
    'Partidas de 10, 15 o 20 preguntas, hasta el número de figuras del nivel',
    'Tras cada respuesta, definición, distinción con figuras parecidas y un segundo ejemplo',
    'Marcador en vivo de pregunta, aciertos y precisión',
    'Resultado con puntuación, porcentaje de acierto y tiempo',
    'Jugar de nuevo con otra tanda sin recargar',
  ],
});

// Una sola fuente para la FAQ visible y el FAQPage (hallazgos 3653 y 3654): faq.ts
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
    '@type': 'Question',
    name: p.pregunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: p.respuesta,
    },
  })),
};
