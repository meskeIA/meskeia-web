import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ecuaciones y Regla de Ruffini - Lineales, Cuadráticas y Grado 3+ | meskeIA',
  description: '¿Necesitas resolver ecuaciones algebraicas? Calculadora paso a paso para ecuaciones lineales, cuadráticas, sistemas 2x2 y polinomios de grado 3, 4 y 5 con la regla de Ruffini: candidatos a raíz racional, tabla de división sintética y factorización completa.',
  keywords: 'regla de ruffini, ruffini paso a paso, división sintética, factorizar polinomios, división de polinomios, raíces de un polinomio, ecuaciones de tercer grado, ecuaciones algebraicas, resolver ecuaciones, ecuaciones cuadráticas, sistemas de ecuaciones, discriminante, álgebra online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ecuaciones y Ruffini - Resolución Paso a Paso',
    description: 'Resuelve ecuaciones lineales, cuadráticas, sistemas 2x2 y polinomios de grado 3+ con la regla de Ruffini, con la tabla de división sintética completa',
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
    description: 'Resuelve ecuaciones y factoriza polinomios con Ruffini, paso a paso y con gráficas interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Ecuaciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Ecuaciones y Regla de Ruffini",
  description: "Calculadora paso a paso de ecuaciones lineales, cuadráticas y sistemas 2x2, y factorización de polinomios de grado 3, 4 y 5 con la regla de Ruffini: candidatos a raíz racional, tabla de división sintética y factorización completa.",
  url: "https://meskeia.com/algebra-ecuaciones/",
  category: 'EducationalApplication',
  features: [
    "Ecuaciones lineales de primer grado con los pasos del despeje",
    "Ecuaciones cuadráticas con discriminante, vértice y gráfica de la parábola",
    "Sistemas de dos ecuaciones con dos incógnitas por la regla de Cramer",
    "Polinomios de grado 3, 4 y 5 factorizados con la regla de Ruffini",
    "Candidatos a raíz racional (±p/q) por el teorema de la raíz racional",
    "Tabla de división sintética completa en cada paso, con cociente y resto",
    "Aritmética con fracciones exactas: admite raíces racionales como 1/2 o −1/3",
    "Multiplicidad agrupada en la factorización final",
  ],
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
        text: 'Ecuaciones lineales de primer grado (ax + b = 0), ecuaciones cuadráticas de segundo grado (ax² + bx + c = 0), sistemas de dos ecuaciones con dos incógnitas (2×2) y polinomios de grado 3, 4 y 5, que se factorizan con la regla de Ruffini. En todos los casos se muestran los pasos: el despeje, el discriminante, los determinantes de Cramer o la tabla de división sintética según corresponda.',
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
      name: '¿Cómo se aplica la regla de Ruffini paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se escriben los coeficientes del polinomio en orden descendente, poniendo 0 en los grados que falten. Se prueba una raíz candidata: se baja el primer coeficiente, se multiplica por la raíz, se suma al siguiente coeficiente y se repite hasta el final. Si el último número (el resto) es 0, el candidato es raíz y los demás números son los coeficientes del cociente, un polinomio de un grado menos. El proceso se repite sobre ese cociente hasta agotar las raíces racionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores hay que probar como raíz en Ruffini?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los que da el teorema de la raíz racional: todas las fracciones ±p/q donde p es divisor del término independiente y q divisor del coeficiente principal. Si el coeficiente principal es 1, basta con probar los divisores enteros del término independiente (±1, ±2, ±3…), empezando siempre por los más pequeños. Si ninguno anula el polinomio, este no tiene raíces racionales y Ruffini no sirve, aunque puede tener raíces irracionales como la raíz cúbica de 2.',
      },
    },
  ],
};
