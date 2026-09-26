import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { PREGUNTAS_HISTORIA } from '@/data/preguntas-historia-espana';

// Las cifras salen del banco: la metadata ya prometió «9 épocas» y «hasta 1978» mientras el
// banco tenía otras (hallazgos 2118 y 2120).
const TOTAL = PREGUNTAS_HISTORIA.length;
const EPOCAS = new Set(PREGUNTAS_HISTORIA.map((p) => p.epoca)).size;

export const metadata: Metadata = {
  title: 'Quiz Historia de España — De los íberos a la democracia | meskeIA',
  description:
    `Pon a prueba tus conocimientos de historia española: ${TOTAL} preguntas desde la época prerromana hasta la Constitución de 1978 y la democracia. 3 niveles de dificultad y ${EPOCAS} épocas históricas.`,
  keywords:
    'quiz historia españa, test historia española, preguntas historia españa, historia de españa quiz, reconquista quiz, guerra civil quiz, transicion democratica, reyes catolicos, carlos I, felipe II, constitucion 1978, bachillerato, selectividad, preparatoria, secundaria, examen de admisión universitaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Historia de España — De los íberos a la democracia',
    description:
      `Pon a prueba tus conocimientos de historia española con ${TOTAL} preguntas. 3 niveles de dificultad, desde la época prerromana hasta la democracia.`,
    url: 'https://meskeia.com/quiz-historia-espana/',
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
    title: 'Quiz Historia de España',
    description:
      '¿Cuánto sabes de historia española? Desde los íberos y los romanos hasta la democracia. ¡Pon a prueba tus conocimientos!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Historia de España",
  description: `Pon a prueba tus conocimientos de historia española: ${TOTAL} preguntas desde la época prerromana hasta la Constitución de 1978 y la democracia. 3 niveles de dificultad y ${EPOCAS} épocas históricas.`,
  url: "https://meskeia.com/quiz-historia-espana/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué período histórico cubre el quiz de historia de España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El quiz abarca desde los pueblos prerromanos y la conquista romana de la Península Ibérica (desde el siglo III a.C.) hasta la Constitución española de 1978, con un bloque breve sobre hitos de la democracia posterior (23-F, ingreso en la CEE, 1992 y el euro). Las preguntas se reparten en ${EPOCAS} épocas: Prerromana y Romana, visigoda, Al-Ándalus y Reconquista, Reyes Católicos y llegada a América, Habsburgos, Borbones del siglo XVIII, siglo XIX, reinado de Alfonso XIII, República y Guerra Civil, Franquismo y Transición, y democracia.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene y cómo se organizan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El quiz contiene ${TOTAL} preguntas repartidas en tres niveles: Fácil (partidas de 10 preguntas), Medio (15) y Difícil (20), y cada partida saca sus preguntas solo del nivel elegido. Dentro de cada nivel las épocas se mezclan al azar; no hay filtro por época. Las preguntas se basan en hechos contrastables y cada respuesta lleva una explicación.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué exámenes o asignaturas sirve este quiz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para preparar la asignatura de Historia de España de 2.º de Bachillerato y el examen de Selectividad (EBAU/EvAU), que incluye obligatoriamente Historia de España. También sirve para estudiantes hispanoamericanos de preparatoria, secundaria o que preparan un examen de admisión universitaria con contenidos de historia de España, para oposiciones que incluyen cultura general española, y para cualquier persona interesada en conocer la historia del país.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este quiz de los test de historia que hay en otras páginas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Las preguntas están diseñadas para ser verificables: cada respuesta correcta tiene una justificación basada en hechos documentados, no en interpretaciones. Además, reúne ${EPOCAS} épocas históricas en un solo sitio, sin publicidad ni registro, con tres niveles de dificultad para adaptarse a distintos objetivos de estudio.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué época de la historia de España tiene más peso en Selectividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la EBAU/EvAU, el temario oficial de Historia de España de 2.º de Bachillerato da mayor peso a los siglos XIX y XX: el liberalismo y la Restauración, la Segunda República (1931-1939), la Guerra Civil (1936-1939), el Franquismo y la Transición democrática. El período anterior a 1800 suele aparecer en preguntas de contexto o en la parte de nivel básico.',
      },
    },
  ],
};
