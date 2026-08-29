import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Programación Dinámica - Mochila, LCS y Fibonacci | meskeIA',
  description:
    'Rellena la tabla de programación dinámica paso a paso y entiende cómo se construye la solución. Tres problemas clásicos editables: la mochila 0/1, la subsecuencia común más larga (LCS) y Fibonacci con memoización, con el resaltado de las celdas de las que depende cada valor.',
  keywords:
    'programación dinámica, dynamic programming, mochila 0/1, knapsack, subsecuencia común más larga, LCS, Fibonacci memoización, tabla DP, memoization, tabulación, subproblemas solapados, algoritmia, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-programacion-dinamica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Programación Dinámica | meskeIA',
    description: 'Rellena la tabla DP paso a paso: mochila 0/1, LCS y Fibonacci',
    url: 'https://meskeia.com/simulador-programacion-dinamica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Programación Dinámica | meskeIA',
    description: 'Mochila 0/1, LCS y Fibonacci: la tabla DP rellenada paso a paso',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Programación Dinámica',
  description:
    'Simulador interactivo de programación dinámica que rellena la tabla de subproblemas paso a paso. Incluye tres problemas clásicos editables: la mochila 0/1, la subsecuencia común más larga (LCS) y Fibonacci con memoización. En cada celda muestra de qué celdas anteriores depende y reconstruye la solución óptima al final.',
  url: 'https://meskeia.com/simulador-programacion-dinamica/',
  category: 'EducationalApplication',
  features: [
    'Tabla DP rellenada celda a celda, paso a paso',
    'Mochila 0/1 con objetos y capacidad editables',
    'Subsecuencia común más larga (LCS) con cadenas editables',
    'Fibonacci con memoización',
    'Resaltado de las celdas de las que depende cada valor',
    'Reconstrucción de la solución óptima',
    'En español',
  ],
  keywords: ['programación dinámica', 'mochila 0/1', 'LCS', 'Fibonacci', 'tabla DP'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la programación dinámica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La programación dinámica es una técnica para resolver problemas dividiéndolos en subproblemas más pequeños que se solapan. En lugar de recalcular el mismo subproblema una y otra vez (como hace la recursión ingenua), guarda cada resultado en una tabla y lo reutiliza. Así, problemas que tardarían un tiempo exponencial se resuelven en tiempo polinómico. Requiere dos propiedades: subestructura óptima y subproblemas solapados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre memoización y tabulación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son las dos formas de aplicar programación dinámica. La memoización es de arriba abajo (top-down): se escribe la recursión normal y se guarda en una caché cada resultado para no repetirlo. La tabulación es de abajo arriba (bottom-up): se rellena una tabla empezando por los casos base hasta llegar a la solución, sin recursión. La tabulación suele ser más eficiente en memoria y evita el desbordamiento de pila; la memoización es más fácil de escribir a partir de la recursión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el problema de la mochila 0/1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dado un conjunto de objetos con un peso y un valor, y una mochila con capacidad limitada, hay que elegir qué objetos meter para maximizar el valor total sin pasarse del peso. Se llama 0/1 porque cada objeto se coge entero o no se coge (no se pueden partir). Se resuelve con una tabla dp[i][w] que guarda el mejor valor usando los primeros i objetos con capacidad w, decidiendo en cada celda entre coger o no coger el objeto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la subsecuencia común más larga (LCS)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La LCS (Longest Common Subsequence) de dos cadenas es la secuencia más larga de caracteres que aparece en ambas en el mismo orden, aunque no sean consecutivos. Por ejemplo, la LCS de "ABCBDAB" y "BDCAB" es "BCAB". Se resuelve con una tabla dp[i][j]: si los caracteres coinciden, se suma 1 a la diagonal; si no, se toma el máximo de la celda de arriba y la de la izquierda. Es la base de herramientas como diff y del control de versiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar programación dinámica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el problema se puede descomponer en subproblemas que se repiten y cuya solución óptima se construye a partir de la de los subproblemas (subestructura óptima). Casos típicos: optimización con restricciones (mochila, cambio de monedas), comparación de secuencias (LCS, distancia de edición), caminos en rejillas y muchos problemas sobre cadenas o grafos. Si los subproblemas no se solapan, suele ser mejor divide y vencerás; si no hay subestructura óptima, la programación dinámica no aplica.',
      },
    },
  ],
};
