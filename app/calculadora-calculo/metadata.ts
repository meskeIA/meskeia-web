import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cálculo - Derivadas, Integrales y Límites | meskeIA',
  description: 'Calculadora de cálculo diferencial e integral: deriva e integra funciones, calcula límites con explicaciones paso a paso. Funciona en el navegador. Gratis.',
  keywords: 'derivadas, integrales, límites, cálculo diferencial, cálculo integral, funciones, análisis matemático',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cálculo | meskeIA',
    description: 'Deriva e integra funciones, calcula límites con explicaciones paso a paso.',
    url: 'https://meskeia.com/calculadora-calculo/',
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
    title: 'Calculadora de Cálculo | meskeIA',
    description: 'Herramienta de cálculo diferencial e integral online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Cálculo",
  description: "Calculadora de cálculo diferencial e integral: deriva e integra funciones, calcula límites con explicaciones paso a paso. Funciona en el navegador. Gratis.",
  url: "https://meskeia.com/calculadora-calculo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué operaciones de cálculo puedo realizar con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes calcular derivadas de funciones (incluyendo reglas de la cadena, producto y cociente), integrales definidas e indefinidas, y límites de funciones. La herramienta procesa funciones algebraicas, trigonométricas, logarítmicas y exponenciales, y muestra el resultado con los pasos intermedios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la derivada de una función con esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Introduce la función en notación estándar (por ejemplo, x^2 + 3x o sin(x)*cos(x)) y selecciona "Derivada". La calculadora aplica las reglas de diferenciación y devuelve la función derivada simplificada. Para funciones compuestas aplica automáticamente la regla de la cadena.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una integral definida y una indefinida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La integral indefinida calcula la antiderivada de una función y devuelve una familia de funciones con la constante de integración C. La integral definida calcula el área bajo la curva entre dos valores concretos (límites a y b) y devuelve un número. Esta calculadora permite calcular ambos tipos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas o cursos es útil esta calculadora de cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de bachillerato de Matemáticas II, y para primero y segundo de carrera en asignaturas como Análisis Matemático, Cálculo Diferencial e Integral o Métodos Matemáticos. También sirve a cualquier persona que necesite verificar derivadas e integrales de forma rápida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene frente a usar directamente Wolfram Alpha o similares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Esta herramienta está en español, tiene una interfaz simplificada orientada al aprendizaje y no requiere conocer la sintaxis específica de ningún motor de cálculo simbólico. Para cálculos de complejidad media es suficiente y más accesible para estudiantes hispanohablantes que se inician en el cálculo.',
      },
    },
  ],
};
