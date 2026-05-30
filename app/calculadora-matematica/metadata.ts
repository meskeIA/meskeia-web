import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora Matemática Avanzada - Matrices, Ecuaciones | meskeIA',
  description: 'Calculadora científica avanzada: operaciones con matrices, determinantes, sistemas de ecuaciones, fracciones y expresiones algebraicas.',
  keywords: 'calculadora matemática, matrices, determinantes, sistemas ecuaciones, fracciones, álgebra, científica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Matemática Avanzada | meskeIA',
    description: 'Calculadora científica con matrices, determinantes y sistemas de ecuaciones.',
    url: 'https://meskeia.com/calculadora-matematica/',
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
    title: 'Calculadora Matemática Avanzada | meskeIA',
    description: 'Herramienta matemática avanzada online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Matemática Avanzada - Matrices, Ecuaciones",
  description: "Calculadora científica avanzada: operaciones con matrices, determinantes, sistemas de ecuaciones, fracciones y expresiones algebraicas.",
  url: 'https://meskeia.com/calculadora-matematica/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué operaciones permite hacer esta calculadora matemática avanzada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Permite realizar operaciones con matrices (suma, resta, multiplicación, determinante, inversa), resolver sistemas de ecuaciones lineales, operar con fracciones y simplificar expresiones algebraicas. Todo funciona directamente en el navegador sin necesidad de instalar ningún programa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el determinante de una matriz con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la operación "Determinante" en la sección de matrices, introduce los valores de la matriz cuadrada (2×2 o 3×3) y pulsa calcular. La herramienta aplica la regla de Sarrus para matrices 3×3 y la fórmula ad−bc para matrices 2×2, mostrando el resultado de forma inmediata.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensada esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria, bachillerato y primeros cursos universitarios que trabajan con álgebra lineal, matrices y sistemas de ecuaciones. También resulta práctica para cualquier persona que necesite resolver cálculos algebraicos de forma rápida y verificar resultados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta calculadora y una calculadora científica convencional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las calculadoras científicas físicas suelen limitarse a funciones básicas y trigonométricas. Esta herramienta añade operaciones con matrices completas (hasta 3×3), resolución de sistemas de ecuaciones paso a paso y simplificación de expresiones algebraicas simbólicas, funcionalidades que no están disponibles en modelos estándar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es necesario registrarse o pagar para usar la calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La calculadora es completamente gratuita y no requiere registro. Funciona al 100 % en el navegador sin descargar ninguna aplicación, y no almacena los datos introducidos.',
      },
    },
  ],
};
