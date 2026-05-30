import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ecuaciones - Resolver Ecuaciones Lineales y Cuadráticas | meskeIA',
  description: '¿Necesitas resolver ecuaciones algebraicas? Calculadora paso a paso para ecuaciones lineales, cuadráticas y sistemas de ecuaciones 2x2. Visualiza gráficas de parábolas y aprende mientras resuelves.',
  keywords: 'ecuaciones algebraicas, resolver ecuaciones, ecuaciones cuadráticas, ecuaciones lineales, sistemas de ecuaciones, fórmula cuadrática, factorización, discriminante, calculadora matemática, álgebra online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ecuaciones Algebraicas - Resolución Paso a Paso',
    description: 'Resuelve ecuaciones lineales, cuadráticas y sistemas 2x2 con explicaciones paso a paso y visualización gráfica de parábolas',
    url: 'https://meskeia.com/algebra-ecuaciones/',
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
    title: 'Calculadora de Ecuaciones | meskeIA',
    description: 'Resuelve ecuaciones algebraicas con explicaciones paso a paso y gráficas interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Ecuaciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Ecuaciones",
  description: "¿Necesitas resolver ecuaciones algebraicas? Calculadora paso a paso para ecuaciones lineales, cuadráticas y sistemas de ecuaciones 2x2. Visualiza gráficas de parábolas y aprende mientras resuelves.",
  url: "https://meskeia.com/algebra-ecuaciones/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de ecuaciones puedo resolver con esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes resolver ecuaciones lineales de primer grado (ax + b = 0), ecuaciones cuadráticas de segundo grado (ax² + bx + c = 0) y sistemas de dos ecuaciones con dos incógnitas (2×2). La calculadora muestra los pasos de resolución y, en el caso de las cuadráticas, calcula el discriminante para determinar el tipo de soluciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la resolución paso a paso de ecuaciones cuadráticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Introduce los coeficientes a, b y c de la ecuación cuadrática. La herramienta aplica la fórmula general (−b ± √(b²−4ac)) / 2a, calcula primero el discriminante y determina si hay dos soluciones reales, una solución doble o soluciones complejas. Cada operación se detalla de forma visible para facilitar el aprendizaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el discriminante y para qué sirve en una ecuación cuadrática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El discriminante es el valor b²−4ac de la fórmula cuadrática. Si es positivo, la ecuación tiene dos soluciones reales distintas; si es cero, tiene una solución doble; si es negativo, las soluciones son números complejos. Conocer el discriminante antes de resolver permite anticipar el tipo de resultado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo ver la gráfica de la ecuación después de resolverla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Para las ecuaciones cuadráticas se genera automáticamente la gráfica de la parábola correspondiente, marcando los puntos de corte con el eje X (las raíces) y el vértice. Esto ayuda a comprender visualmente la relación entre los coeficientes y la forma de la curva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene usar esta herramienta frente a resolver las ecuaciones a mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Resolver a mano es valioso para aprender, pero esta herramienta permite verificar resultados al instante, detectar errores de cálculo y explorar distintos valores de coeficientes de forma ágil. Al mostrar cada paso intermedio, también sirve como guía didáctica para entender el procedimiento correcto.',
      },
    },
  ],
};
