import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Textos - Encuentra Diferencias (Diff) | meskeIA',
  description: 'Compara dos textos y encuentra las diferencias. Resalta líneas añadidas, eliminadas y modificadas estilo diff. Gratis, privado y sin registro.',
  keywords: 'comparador textos, diff online, comparar archivos, diferencias texto, text compare, encontrar cambios, merge, comparar codigo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Textos Online - Diff',
    description: 'Compara dos textos lado a lado y encuentra todas las diferencias. Herramienta gratuita.',
    url: 'https://meskeia.com/comparador-textos/',
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
    title: 'Comparador de Textos | meskeIA',
    description: 'Encuentra diferencias entre dos textos con resaltado visual',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador de Textos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador de Textos",
  description: "Compara dos textos y encuentra las diferencias. Resalta líneas añadidas, eliminadas y modificadas estilo diff. Gratis, privado y sin registro.",
  url: "https://meskeia.com/comparador-textos/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un comparador de textos o diff online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un comparador de textos (o "diff") es una herramienta que analiza dos versiones de un texto y muestra visualmente qué líneas se han añadido, eliminado o modificado. Es el mismo principio que usan sistemas de control de versiones como Git para detectar cambios en el código fuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la comparación de textos línea a línea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El algoritmo divide cada texto en líneas y las compara una a una usando la técnica LCS (Longest Common Subsequence). Las líneas solo presentes en el texto original se marcan en rojo (eliminadas), las nuevas en verde (añadidas) y las comunes permanecen sin resaltar. El resultado es legible de un vistazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa un comparador de textos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se usa para revisar cambios entre dos versiones de un documento, contrato o artículo; detectar plagios o copias parciales; comparar salidas de programas o logs; y verificar que una traducción no ha omitido fragmentos del original. También es muy útil al hacer revisiones de código sin acceso a Git.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre comparar textos y usar Git diff?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Git diff opera sobre archivos versionados en un repositorio y muestra diferencias en formato de parche (patch). Un comparador de textos online permite comparar cualquier fragmento de texto pegado directamente, sin necesidad de tener un repositorio ni instalar ningún programa. Es la opción más rápida para comparaciones puntuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los textos que comparo se envían a algún servidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La comparación se realiza completamente en el navegador mediante JavaScript. Ningún texto se transmite a servidores externos, lo que garantiza total privacidad. Esto lo hace adecuado para comparar documentos confidenciales, contratos o código propietario.',
      },
    },
  ],
};
