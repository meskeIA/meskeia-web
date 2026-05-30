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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ADN y ARN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ADN (ácido desoxirribonucleico) es de doble cadena, contiene desoxirribosa y usa las bases adenina, guanina, citosina y timina; almacena la información genética de forma permanente en el núcleo. El ARN (ácido ribonucleico) es generalmente monocatenario, contiene ribosa y sustituye la timina por uracilo; actúa como intermediario durante la expresión génica. Existen tres tipos principales de ARN: mensajero (ARNm), ribosómico (ARNr) y de transferencia (ARNt).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre durante la replicación del ADN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La replicación es el proceso por el que una célula copia su ADN antes de dividirse. La enzima helicasa separa las dos cadenas del ADN; la ADN polimerasa sintetiza una nueva cadena complementaria usando cada cadena original como molde, siempre en dirección 5\'→3\'. El resultado son dos moléculas hijas, cada una con una cadena original y una nueva (replicación semiconservativa). En eucariotas se inicia en múltiples orígenes de replicación simultáneamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre transcripción y traducción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La transcripción es la síntesis de ARNm a partir de una cadena de ADN molde, realizada por la ARN polimerasa en el núcleo (en eucariotas). La traducción ocurre después, en los ribosomas: el ARNm es leído en tripletes (codones) y los ARNt traen los aminoácidos correspondientes para ensamblar la proteína. Ambos procesos constituyen la expresión génica y siguen el dogma central de la biología molecular (ADN → ARN → proteína).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel es adecuado este test de biología molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz está diseñado para estudiantes de Bachillerato científico (2.º curso, asignatura de Biología) y para alumnos de primer año de Biología, Biomedicina, Farmacia o Biotecnología universitaria. También sirve como repaso para opositores de secundaria en la especialidad de Biología y Geología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de mutaciones cubre el quiz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bloque de mutaciones incluye preguntas sobre mutaciones génicas (sustitución, inserción y deleción de bases), mutaciones cromosómicas estructurales (inversión, translocación, deleción e inversión) y numéricas (aneuploidía y poliploidía). También se abordan conceptos de mutágenos físicos y químicos y la diferencia entre mutaciones silenciosas, de sentido erróneo y sin sentido.',
      },
    },
  ],
};
