import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lógica Proposicional: Tablas de Verdad, Tautologías y Formas Normales | meskeIA',
  description: 'Visualizador interactivo de lógica proposicional. Tablas de verdad para AND/OR/NOT/XOR, evaluador de fórmulas con 3 variables, clasificador de tautología, contradicción y contingencia, y formas normales FNC/FND.',
  keywords: 'lógica proposicional, tablas de verdad AND OR NOT, tautología contradicción contingencia, FNC FND forma normal, lógica matemática bachillerato preparatoria secundaria, conectores lógicos implicación equivalencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lógica Proposicional: Tablas de Verdad, Tautologías y Formas Normales',
    description: '¿Cómo funcionan los conectores lógicos? Explora AND, OR, NOT, XOR, implicación y equivalencia con tablas de verdad interactivas, clasificación de fórmulas y formas normales FNC/FND.',
    url: 'https://meskeia.com/visualizador-logica-proposicional/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lógica Proposicional Interactiva | meskeIA',
    description: 'Tablas de verdad, tautologías y formas normales FNC/FND en un visualizador interactivo para bachillerato, preparatoria y universidad.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: { 'application-name': 'Lógica Proposicional meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Lógica Proposicional',
  description: 'Visualizador interactivo de lógica proposicional: tablas de verdad para los 6 conectores lógicos, evaluador de fórmulas con hasta 3 variables, clasificación en tautología, contradicción o contingencia, y formas normales FNC/FND con ejemplos clásicos.',
  url: 'https://meskeia.com/visualizador-logica-proposicional/',
  features: [
    'Tabla de verdad interactiva para AND, OR, NOT, XOR, implicación y equivalencia',
    'Toggles P/Q/R para ver resultados en tiempo real con colores V/F',
    'Evaluador de fórmulas con tabla de verdad completa de hasta 8 filas',
    'Ejemplos predefinidos: tautología, contradicción y contingencia',
    'Formas Normales Conjuntiva (FNC) y Disyuntiva (FND) para 3 variables',
    'Construcción de la forma canónica a partir de las filas verdaderas',
  ],
  category: 'EducationalApplication',
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la lógica proposicional y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lógica proposicional es una rama de la lógica formal que estudia cómo combinar proposiciones simples (enunciados que pueden ser verdaderos o falsos) mediante conectores lógicos para obtener proposiciones compuestas. Se usa en matemáticas para construir demostraciones, en informática para diseñar circuitos digitales y programar condiciones, y en filosofía para analizar argumentos. Es la base de la lógica de primer orden y de la mayoría de los sistemas de razonamiento formal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los conectores lógicos principales y qué significa cada uno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los seis conectores básicos son: negación (¬P, "no P"), conjunción (P∧Q, "P y Q"), disyunción (P∨Q, "P o Q"), disyunción exclusiva (P⊕Q, "P o Q pero no ambas"), implicación (P→Q, "si P entonces Q") y equivalencia (P↔Q, "P si y solo si Q"). La implicación solo es falsa cuando el antecedente es verdadero y el consecuente es falso; la equivalencia es verdadera cuando ambas proposiciones tienen el mismo valor de verdad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se construye una tabla de verdad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para construir una tabla de verdad se listan todas las combinaciones posibles de valores (V/F) de las variables (con n variables hay 2ⁿ filas) y se evalúa la fórmula fila a fila aplicando las reglas de cada conector. Con 2 variables (P, Q) hay 4 filas; con 3 variables (P, Q, R) hay 8. Si la fórmula es verdadera en todas las filas es una tautología; si es falsa en todas, una contradicción; si varía, una contingencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la forma canónica y la expresión mínima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma canónica (FND o FNC) enumera un término por cada fila de la tabla de verdad: con 4 filas verdaderas salen 4 términos, todos con el mismo número de literales. La expresión mínima agrupa esos términos para eliminar variables y dejar la fórmula más corta que sigue siendo equivalente. Ambas describen la misma función, pero la mínima necesita menos puertas al construir el circuito; se obtiene con mapas de Karnaugh o con el algoritmo de Quine-McCluskey.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la Forma Normal Conjuntiva (FNC) y la Forma Normal Disyuntiva (FND)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La FND (suma de productos) expresa la fórmula como una disyunción (OR) de conjunciones (AND): cada término agrupa las variables que hacen la fórmula verdadera. La FNC (producto de sumas) la expresa como una conjunción (AND) de disyunciones (OR): cada cláusula recoge las variables que evitan que la fórmula sea falsa. Cualquier fórmula proposicional puede expresarse en ambas formas normales, que son equivalentes entre sí.',
      },
    },
  ],
};
