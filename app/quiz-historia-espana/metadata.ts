import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Historia de España — Desde los Íberos hasta la Constitución de 1978 | meskeIA',
  description:
    'Pon a prueba tus conocimientos de historia española: 81 preguntas verificables desde la época romana hasta la Constitución de 1978. 3 dificultades, 9 épocas históricas.',
  keywords:
    'quiz historia españa, test historia española, preguntas historia españa, historia de españa quiz, reconquista quiz, guerra civil quiz, transicion democratica, reyes catolicos, carlos I, felipe II, constitucion 1978, bachillerato, selectividad, preparatoria, secundaria, examen de admisión universitaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Historia de España — Desde los Íberos hasta la Constitución de 1978',
    description:
      'Pon a prueba tus conocimientos de historia española con 81 preguntas verificables. 3 dificultades, desde la época romana hasta 1978.',
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
      '¿Cuánto sabes de historia española? Desde los romanos hasta la Constitución de 1978. ¡Pon a prueba tus conocimientos!',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Historia de España",
  description: "Pon a prueba tus conocimientos de historia española: 81 preguntas verificables desde la época romana hasta la Constitución de 1978. 3 dificultades, 9 épocas históricas.",
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
        text: 'El quiz abarca desde la presencia romana en la Península Ibérica (siglo III a.C.) hasta la aprobación de la Constitución española de 1978, que marca el final de la Transición democrática. Se estructura en 9 épocas: romanización, visigodos, Al-Ándalus, Reconquista, Reyes Católicos, Imperio español, siglo XIX, Guerra Civil y Franquismo, y Transición.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas preguntas tiene y cómo se organizan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz contiene 81 preguntas verificables repartidas en tres niveles de dificultad: básico, medio y avanzado. Todas las preguntas están basadas en hechos contrastables de fuentes históricas reconocidas, sin opiniones ni interpretaciones controvertidas. Puedes seleccionar el nivel y la época histórica que quieras repasar.',
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
        text: 'Las preguntas están diseñadas para ser verificables: cada respuesta correcta tiene una justificación basada en hechos documentados, no en interpretaciones. Además, cubre 9 épocas históricas completas en un solo sitio, sin publicidad ni registro, con tres niveles de dificultad para adaptarse a distintos objetivos de estudio.',
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
