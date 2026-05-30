import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora MCD y MCM Online - Máximo Común Divisor y Mínimo Común Múltiplo | meskeIA',
  description: 'Calculadora de MCD (Máximo Común Divisor) y MCM (Mínimo Común Múltiplo) online y gratuita. Calcula hasta 5 números con explicación paso a paso del método.',
  keywords: 'mcd, mcm, maximo comun divisor, minimo comun multiplo, calcular mcd, calcular mcm, matematicas, divisores, multiplos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora MCD y MCM Online - meskeIA',
    description: 'Calcula el MCD y MCM de varios números con explicación paso a paso.',
    url: 'https://meskeia.com/calculadora-mcd-mcm/',
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
    title: 'Calculadora MCD y MCM Online',
    description: 'Calcula el MCD y MCM de varios números con explicación paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora MCD y MCM",
  description: "Calculadora de MCD (Máximo Común Divisor) y MCM (Mínimo Común Múltiplo) online y gratuita. Calcula hasta 5 números con explicación paso a paso del método.",
  url: "https://meskeia.com/calculadora-mcd-mcm/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Máximo Común Divisor (MCD)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Máximo Común Divisor (MCD) de dos o más números enteros es el número más grande que divide a todos ellos sin dejar resto. Por ejemplo, el MCD de 12 y 18 es 6, porque 6 es el mayor número que divide exactamente a ambos. Se usa principalmente para simplificar fracciones: dividiendo numerador y denominador por su MCD se obtiene la fracción irreducible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Mínimo Común Múltiplo (MCM)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Mínimo Común Múltiplo (MCM) de dos o más números es el número más pequeño que es múltiplo de todos ellos. Por ejemplo, el MCM de 4 y 6 es 12, porque 12 es el menor número al que llegan ambas tablas de multiplicar. Se utiliza principalmente para sumar o restar fracciones con distinto denominador: el denominador común es el MCM de los denominadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el MCD paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método más eficiente es el algoritmo de Euclides: se divide el número mayor entre el menor y se toma el resto; luego se divide el divisor anterior entre ese resto, y así sucesivamente hasta que el resto sea cero. El último divisor no nulo es el MCD. Por ejemplo, MCD(48, 18): 48 = 2×18 + 12; 18 = 1×12 + 6; 12 = 2×6 + 0 → MCD = 6. La calculadora muestra cada paso de este proceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo calcular el MCD y MCM de más de dos números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Para más de dos números se aplica el método de forma encadenada: primero se calcula el MCD (o MCM) de los dos primeros, y ese resultado se combina con el tercer número, y así sucesivamente. La calculadora admite hasta 5 números a la vez y realiza todo el proceso automáticamente, mostrando la descomposición en factores primos de cada número para facilitar la comprensión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la relación entre el MCD y el MCM de dos números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para dos números a y b existe una relación directa: MCD(a,b) × MCM(a,b) = a × b. Esto significa que si conoces uno puedes calcular el otro sin repetir el proceso desde cero. Por ejemplo, con a=12 y b=18: MCD=6, MCM=36, y efectivamente 6 × 36 = 12 × 18 = 216. Esta propiedad es válida únicamente para pares de números, no para tres o más.',
      },
    },
  ],
};
