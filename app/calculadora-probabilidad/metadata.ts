import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Probabilidad Online - Combinatoria y Estadística | meskeIA',
  description: 'Calcula probabilidades, combinaciones, permutaciones y distribuciones estadísticas. Herramienta completa con simulaciones y teoría de probabilidad.',
  keywords: 'probabilidad, combinatoria, permutaciones, combinaciones, factorial, distribución binomial, estadística, azar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Probabilidad | meskeIA',
    description: 'Calcula probabilidades, combinaciones y permutaciones. Incluye distribuciones estadísticas y simulaciones.',
    url: 'https://meskeia.com/calculadora-probabilidad/',
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
    title: 'Calculadora de Probabilidad | meskeIA',
    description: 'Herramienta completa de probabilidad y combinatoria online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Probabilidad",
  description: "Calcula probabilidades, combinaciones, permutaciones y distribuciones estadísticas. Herramienta completa con simulaciones y teoría de probabilidad.",
  url: "https://meskeia.com/calculadora-probabilidad/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la probabilidad y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La probabilidad es una medida numérica entre 0 y 1 que expresa la posibilidad de que ocurra un evento. Se usa en estadística, ciencias, ingeniería, economía y vida cotidiana para tomar decisiones bajo incertidumbre: desde calcular el riesgo de un seguro hasta predecir resultados en experimentos científicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre combinaciones y permutaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las permutaciones tienen en cuenta el orden de los elementos, mientras que las combinaciones no. Por ejemplo, con los dígitos 1, 2 y 3, las permutaciones de 2 elementos dan 6 resultados distintos (12, 13, 21, 23, 31, 32), mientras que las combinaciones de 2 elementos dan solo 3 (12, 13, 23).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la probabilidad de que ocurran dos eventos independientes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando dos eventos son independientes (uno no afecta al otro), la probabilidad de que ambos ocurran es el producto de sus probabilidades individuales. Por ejemplo, la probabilidad de sacar cara dos veces seguidas con una moneda es 0,5 × 0,5 = 0,25 (un 25%).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la distribución binomial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distribución binomial calcula la probabilidad de obtener exactamente k éxitos en n ensayos independientes, cada uno con la misma probabilidad p de éxito. Es útil para modelar situaciones del tipo "cuántas veces sale cara en 10 lanzamientos" o "cuántos productos defectuosos hay en un lote de 100 piezas con tasa de defectos del 3%".',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el factorial de un número y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factorial de un número entero positivo n (escrito n!) es el producto de todos los enteros desde 1 hasta n. Por ejemplo, 5! = 5 × 4 × 3 × 2 × 1 = 120. Es la base del cálculo de combinaciones y permutaciones. Por convenio, 0! = 1.',
      },
    },
  ],
};
