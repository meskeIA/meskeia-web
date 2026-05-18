import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Biología Molecular — ADN, ARN, Replicación y Traducción | meskeIA',
  description:
    'Practica biología molecular con 30 preguntas: ADN/ARN, replicación, transcripción, traducción y mutaciones. Con explicaciones detalladas. Para Bachillerato y 1º de carrera.',
  keywords: [
    'quiz biología molecular',
    'test ADN ARN',
    'replicación ADN',
    'transcripción ARN',
    'traducción proteínas',
    'mutaciones genéticas',
    'biología bachillerato',
    'código genético',
    'dogma central biología',
    'quiz ciencias biología',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Biología Molecular | meskeIA',
    description:
      '30 preguntas sobre ADN/ARN, replicación, transcripción, traducción y mutaciones. Con explicaciones detalladas tras cada respuesta.',
    url: 'https://meskeia.com/quiz-biologia-molecular/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz de Biología Molecular',
    description: '30 preguntas en 5 categorías: ADN/ARN, replicación, transcripción, traducción y mutaciones. ¡Con explicaciones!',
  },
  other: {
    'application-name': 'Quiz Biología Molecular meskeIA',
  },
  alternates: {
    canonical: 'https://meskeia.com/quiz-biologia-molecular/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz de Biología Molecular',
  description:
    'Quiz interactivo de biología molecular con 30 preguntas en 5 categorías: estructura de ADN y ARN, replicación del ADN, transcripción, traducción y mutaciones. Incluye explicaciones detalladas tras cada respuesta y modos de examen completo y práctica por categoría.',
  url: 'https://meskeia.com/quiz-biologia-molecular/',
  category: 'EducationalApplication',
  features: [
    '30 preguntas en 5 categorías: ADN/ARN, replicación, transcripción, traducción, mutaciones',
    'Modo examen completo y modo práctica por categoría',
    'Explicación detallada tras cada respuesta',
    'Puntuación, racha y clasificación final con desglose por categoría',
    'Ideal para Bachillerato y primer año de Biología o Biomedicina',
    'Gratuito, sin registro, en español',
  ],
});
