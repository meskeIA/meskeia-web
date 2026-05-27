import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Historia de España — Desde los Íberos hasta la Constitución de 1978 | meskeIA',
  description:
    'Pon a prueba tus conocimientos de historia española: 81 preguntas verificables desde la época romana hasta la Constitución de 1978. 3 dificultades, 9 épocas históricas.',
  keywords:
    'quiz historia españa, test historia española, preguntas historia españa, historia de españa quiz, reconquista quiz, guerra civil quiz, transicion democratica, reyes catolicos, carlos I, felipe II, constitucion 1978',
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
