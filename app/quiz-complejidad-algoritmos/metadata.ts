import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Complejidad Algorítmica — Big O, Ordenación y Estructuras de Datos | meskeIA',
  description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa de algoritmos. Con explicaciones técnicas. Para entrevistas y exámenes.',
  keywords: 'complejidad algorítmica, notación Big O, ordenación algoritmos, estructuras datos, entrevistas técnicas, quiz algoritmia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Complejidad Algorítmica — Big O, Ordenación y Estructuras de Datos | meskeIA',
    description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa de algoritmos. Con explicaciones técnicas.',
    url: 'https://meskeia.com/quiz-complejidad-algoritmos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz Complejidad Algorítmica — Big O | meskeIA',
    description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa. Explicaciones técnicas detalladas.',
  },
  other: {
    'application-name': 'Quiz Complejidad Algorítmica meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Quiz Complejidad Algorítmica — Big O',
  description: 'Quiz de complejidad algorítmica y notación Big O con 25 preguntas en 5 categorías: notación, búsqueda/ordenación, estructuras de datos, análisis de código y comparativa. Ideal para preparar entrevistas técnicas y exámenes de algoritmia.',
  url: 'https://meskeia.com/quiz-complejidad-algoritmos/',
  category: 'EducationalApplication',
  features: [
    '25 preguntas en 5 categorías: notación, ordenación, estructuras, análisis de código, comparativa',
    'Snippets de código reales para analizar su complejidad',
    'Explicaciones técnicas detalladas tras cada respuesta',
    'Ideal para entrevistas técnicas y asignaturas de algoritmia',
    'Modo práctica por categoría y examen completo',
    'Gratuito, sin registro, en español',
  ],
});
