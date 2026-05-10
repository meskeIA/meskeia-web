import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Teorema de Bayes: Tests Médicos y Probabilidad Condicional | meskeIA',
  description: 'Visualiza el teorema de Bayes con diagrama de árbol y rectángulo proporcional. Por qué un test "99% preciso" puede dar más falsos positivos que verdaderos.',
  keywords: 'teorema de Bayes, probabilidad condicional, valor predictivo positivo, sensibilidad, especificidad, prevalencia, falsos positivos, tests médicos, EBAU, Bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-teorema-bayes/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Teorema de Bayes | meskeIA',
    description: 'La paradoja de los tests médicos: por qué la prevalencia importa tanto como la precisión.',
    url: 'https://meskeia.com/simulador-teorema-bayes/',
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
    title: 'Simulador del Teorema de Bayes | meskeIA',
    description: 'Visualiza P(D|+) con diagrama de árbol y rectángulo proporcional. Casos reales: COVID, mamografía, dopaje.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema de Bayes',
  description: 'Simulador interactivo del teorema de Bayes aplicado a tests médicos y diagnóstico probabilístico. Permite ajustar prevalencia P(D), sensibilidad P(+|D) y especificidad P(-|¬D), y visualiza el resultado de dos formas complementarias: (1) diagrama de árbol mostrando cuántas personas de 1000 caen en cada categoría, (2) rectángulo proporcional con áreas iguales a probabilidades. Calcula automáticamente el valor predictivo positivo VPP = P(D|+), el valor predictivo negativo y los probabilidades post-test. Incluye 5 escenarios reales (test rápido COVID, mamografía, VIH, PSA, dopaje). Ideal para EBAU de Matemáticas y Bachillerato de probabilidad.',
  url: 'https://meskeia.com/simulador-teorema-bayes/',
  category: 'EducationalApplication',
  features: [
    'Dos modos de visualización: diagrama de árbol y rectángulo proporcional',
    'Sliders interactivos de prevalencia, sensibilidad y especificidad',
    '5 escenarios reales preestablecidos (COVID, mamografía, VIH, PSA, dopaje)',
    'Cálculo de valor predictivo positivo (VPP) y negativo (VPN)',
    'Visualización clara de falsos positivos vs verdaderos positivos',
    'Probabilidades pre-test vs post-test',
    'Aplicación de la fórmula de Bayes paso a paso',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['teorema de Bayes', 'probabilidad condicional', 'tests médicos', 'EBAU', 'Bachillerato'],
});
