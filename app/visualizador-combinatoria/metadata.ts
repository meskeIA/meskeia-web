import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Combinatoria: Permutaciones, Combinaciones y Triángulo de Pascal — meskeIA',
  description: 'Visualizador interactivo de combinatoria: permutaciones y combinaciones con árboles animados, triángulo de Pascal con patrones ocultos (Fibonacci, potencias de 2, Sierpinski), principio de multiplicación y binomio de Newton. Ideal para estudiantes de matemáticas.',
  keywords: [
    'combinatoria',
    'permutaciones',
    'combinaciones',
    'triángulo de pascal',
    'binomio de newton',
    'principio de multiplicación',
    'coeficientes binomiales',
    'números de fibonacci',
    'series de sierpinski',
    'probabilidad combinatoria',
    'matemáticas discretas',
    'matemáticas universitarias',
    'bachillerato matemáticas',
    'visualizador matemáticas',
    'factorial',
    'teoría de la probabilidad',
    'criptografía matemáticas',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Combinatoria: Permutaciones, Combinaciones y Triángulo de Pascal — meskeIA',
    description: 'Aprende combinatoria con visualizaciones interactivas: árboles de permutaciones, triángulo de Pascal con patrones y binomio de Newton.',
    url: 'https://meskeia.com/visualizador-combinatoria',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Combinatoria: Permutaciones, Combinaciones y Pascal — meskeIA',
    description: 'Explora la combinatoria con árboles animados, triángulo de Pascal y binomio de Newton de forma interactiva.',
  },
  other: {
    'application-name': 'Visualizador de Combinatoria meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Combinatoria y Triángulo de Pascal',
  description: 'Visualizador interactivo de combinatoria: permutaciones, combinaciones, triángulo de Pascal con patrones ocultos y binomio de Newton.',
  url: 'https://meskeia.com/visualizador-combinatoria/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de permutaciones P(n,k) con árbol visual animado',
    'Cálculo de combinaciones C(n,k) con comparación visual',
    'Triángulo de Pascal SVG interactivo hasta 12 filas',
    'Patrones: Fibonacci, potencias de 2, números triangulares, Sierpinski',
    'Principio de multiplicación con múltiples pasos',
    'Expansión del binomio de Newton con conexión a Pascal',
  ],
  keywords: [
    'combinatoria',
    'permutaciones',
    'combinaciones',
    'triángulo de pascal',
    'binomio de newton',
  ],
});
