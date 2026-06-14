import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora Matemática Avanzada - Matrices, Fracciones, Logaritmos | meskeIA',
  description: 'Calculadora matemática avanzada: matrices 2×2 (suma, resta, multiplicación, determinante, inversa), fracciones, potencias, raíces y logaritmos. Sin registro.',
  keywords: 'calculadora matemática, matrices, determinantes, fracciones, potencias, raíces, logaritmos, álgebra',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Matemática Avanzada | meskeIA',
    description: 'Calculadora matemática con matrices 2×2, fracciones, potencias, raíces y logaritmos.',
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
  name: "Calculadora Matemática Avanzada - Matrices, Fracciones, Logaritmos",
  description: "Calculadora matemática avanzada: operaciones con matrices 2×2 (suma, resta, multiplicación, determinante, inversa), fracciones con simplificación automática, potencias, raíces e índice de logaritmos arbitrario.",
  url: 'https://meskeia.com/calculadora-matematica/',
  category: 'EducationalApplication',
  features: [
      "Matrices 2×2: suma, resta, multiplicación, determinante (fórmula ad−bc) e inversa",
      "Fracciones: suma, resta, multiplicación y división con simplificación automática por MCD",
      "Potencias: cualquier base y exponente, con resultado e inverso (raíz equivalente)",
      "Raíces de cualquier índice con detección de raíz no real en números negativos",
      "Logaritmos en base arbitraria con log₁₀, ln (neperiano) y log₂ simultáneos",
      "Gratuito, sin registro ni instalación",
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
        text: 'Cubre cinco áreas: matrices 2×2 (suma, resta, multiplicación, determinante e inversa), fracciones con simplificación automática, potencias, raíces de cualquier índice y logaritmos en base arbitraria. Todo funciona directamente en el navegador sin necesidad de instalar ningún programa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el determinante de una matriz con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la operación "Determinante" en la sección de matrices, introduce los cuatro valores de la matriz 2×2 y pulsa calcular. La herramienta aplica la fórmula ad−bc y muestra el resultado de forma inmediata. Si el determinante es 0, la herramienta lo indica y avisa de que la matriz no tiene inversa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensada esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria y bachillerato que trabajan con matrices, fracciones, potencias y logaritmos. También sirve para primeros cursos universitarios de matemáticas o ingeniería que necesitan verificar resultados rápidamente y para cualquier persona que quiera repasar estas operaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre esta calculadora y una calculadora científica convencional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las calculadoras científicas físicas no operan con matrices enteras ni simplifican fracciones simbólicamente. Esta herramienta añade operaciones matriciales completas (suma, multiplicación, determinante e inversa para matrices 2×2), simplificación de fracciones por MCD, y logaritmos en base arbitraria con log₁₀ y ln simultáneos.',
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
