import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa | meskeIA',
  description: 'Guía visual de narratología: historia vs. relato vs. narración, tiempo narrativo (analepsis, prolepsis, duración), voz y focalización (Genette) y modelo actancial (Greimas). Con ejemplos de grandes obras literarias.',
  keywords: 'narratologia, genette narratologia, modelo actancial greimas, focalizacion narrativa, analepsis prolepsis, narrador homodiegetico, narrador heterodiegetico, tiempo narrativo, teoria narrativa, estructura relato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
    description: 'Guía visual de narratología con los conceptos de Genette y Greimas. Historia, relato, narración, tiempo, voz, focalización y modelo actancial.',
    url: 'https://meskeia.com/visualizador-narratologia',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
    description: 'Historia vs. relato, tiempo narrativo, voz, focalización y modelo actancial. Con ejemplos literarios.',
  },
  other: {
    'application-name': 'Narratología Visual meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
  description: 'Guía visual de los conceptos fundamentales de narratología: la tricotomía de Genette (historia, relato, narración), tiempo narrativo, voz, focalización y el modelo actancial de Greimas, con ejemplos de grandes obras.',
  url: 'https://meskeia.com/visualizador-narratologia/',
  category: 'EducationalApplication',
  features: [
    'Historia vs. relato vs. narración (tricotomía de Genette)',
    'Tiempo narrativo: anacronías, duración y frecuencia',
    'Voz narrativa: homodiegético, heterodiegético, autodiegético',
    'Focalización: cero, interna y externa',
    'Modelo actancial de Greimas con los 6 actantes',
    'Ejemplos de grandes obras literarias para cada concepto',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la narratología y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La narratología es la disciplina académica que estudia la estructura y los mecanismos de los relatos: cómo están construidos, quién cuenta la historia, desde qué punto de vista, cómo se organiza el tiempo y qué funciones cumplen los personajes. Surgió con el formalismo ruso y se consolidó en Francia con teóricos como Gérard Genette y A.J. Greimas en los años 60-70. Es útil tanto para el análisis literario como para mejorar la escritura creativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre historia, relato y narración según Genette?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gérard Genette distingue tres niveles: la historia (histoire) es el conjunto de acontecimientos en orden cronológico real, independientemente de cómo se cuenten; el relato (récit) es el texto narrativo tal como aparece, con su orden, duración y frecuencia propios; y la narración (narration) es el acto de contar en sí, el proceso enunciativo con su narrador y su situación temporal. Un flashback, por ejemplo, es una anacronía del relato respecto a la historia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la focalización en narratología?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La focalización es el concepto con el que Genette describe quién percibe la historia, es decir, desde qué conciencia o perspectiva se filtra la información. La focalización cero corresponde al narrador omnisciente que sabe más que los personajes; la focalización interna limita la información a lo que sabe un personaje concreto; y la focalización externa da menos información que cualquier personaje (narrador behaviorista). No debe confundirse con la voz narrativa, que responde a quién habla, no a quién ve.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el modelo actancial de Greimas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo actancial de Algirdas Julien Greimas (1966) propone que cualquier relato puede describirse con seis actantes o funciones: Sujeto (quien desea u actúa), Objeto (lo que se desea o busca), Destinador (quien encarga o motiva), Destinatario (quien se beneficia), Ayudante (quien facilita la acción) y Oponente (quien la dificulta). No son personajes sino roles narrativos: un mismo personaje puede ocupar varios actantes y un actante puede encarnarlo varios personajes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son la analepsis y la prolepsis en narrativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son las dos formas básicas de anacronía narrativa según Genette. La analepsis (en inglés flashback) consiste en narrar un acontecimiento posterior al punto presente del relato pero que ocurrió antes en la historia. La prolepsis (flashforward) hace lo contrario: anticipa en el texto algo que sucederá más adelante en la cronología. Ambas son herramientas de construcción temporal que permiten crear intriga, revelar causas o sugerir consecuencias de forma estratégica.',
      },
    },
  ],
};
