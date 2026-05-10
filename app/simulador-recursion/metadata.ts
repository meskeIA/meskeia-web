import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Recursión - Pila de Llamadas y Árbol Recursivo | meskeIA',
  description: 'Visualiza cómo funciona la recursión paso a paso: factorial, Fibonacci, Hanoi, MCD, suma de dígitos y búsqueda binaria. Pila de llamadas viva, árbol de llamadas y comparación con memoization.',
  keywords: 'recursión, pila llamadas, call stack, factorial Fibonacci Hanoi, MCD Euclides, búsqueda binaria recursiva, memoization, programación universidad, FP informática, base case caso recursivo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-recursion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Recursión | meskeIA',
    description: 'Pila de llamadas, árbol recursivo y memoization paso a paso',
    url: 'https://meskeia.com/simulador-recursion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Recursión | meskeIA',
    description: 'Aprende recursión con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Recursión y Pila de Llamadas',
  description:
    'Simulador interactivo de funciones recursivas clásicas. Visualiza la pila de llamadas, el árbol de recursión y compara con/sin memoization para factorial, Fibonacci, Torres de Hanoi, Euclides, suma de dígitos y búsqueda binaria.',
  url: 'https://meskeia.com/simulador-recursion/',
  category: 'EducationalApplication',
  features: [
    '6 funciones recursivas: factorial, Fibonacci, Hanoi, MCD, suma dígitos, búsqueda binaria',
    'Pila de llamadas viva con frames y variables locales',
    'Árbol de llamadas SVG con nodos por estado',
    'Comparación con/sin memoization (Fibonacci)',
    'Animación visual de Torres de Hanoi',
    'Trazado paso a paso de llamadas y retornos',
    'Métricas: llamadas totales, profundidad máxima, eficiencia',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['recursión', 'pila llamadas', 'Fibonacci', 'programación'],
});
