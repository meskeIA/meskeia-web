import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Teoría de Números - Primos, MCD, MCM | meskeIA',
  description: 'Factoriza números en primos, calcula MCD y MCM, encuentra todos los divisores, verifica primalidad y más. Herramienta completa de teoría de números. Gratis.',
  keywords: 'números primos, factorización, MCD, MCM, divisores, teoría de números, criba, Euclides',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Teoría de Números | meskeIA',
    description: 'Números primos, factorización, MCD, MCM y divisores.',
    url: 'https://meskeia.com/calculadora-teoria-numeros/',
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
    title: 'Calculadora Teoría de Números | meskeIA',
    description: 'Herramienta de teoría de números online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Teoría de Números",
  description: "Factoriza números en primos, calcula MCD y MCM, encuentra todos los divisores, verifica primalidad y más. Herramienta completa de teoría de números. Gratis.",
  url: "https://meskeia.com/calculadora-teoria-numeros/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la teoría de números y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La teoría de números es la rama de las matemáticas que estudia las propiedades de los números enteros, especialmente los números naturales. Se ocupa de conceptos como la divisibilidad, los números primos, el máximo común divisor (MCD) y el mínimo común múltiplo (MCM). Es fundamental en criptografía, informática teórica y álgebra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se factoriza un número en sus factores primos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La factorización en primos consiste en expresar un número entero positivo como producto de números primos. Por ejemplo, 60 = 2² × 3 × 5. El algoritmo divide sucesivamente el número por los primos más pequeños (2, 3, 5, 7…) hasta que el cociente es 1. Esta herramienta realiza el proceso automáticamente mostrando cada paso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre MCD y MCM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Máximo Común Divisor (MCD) es el número más grande que divide exactamente a dos o más números; por ejemplo, MCD(12, 18) = 6. El Mínimo Común Múltiplo (MCM) es el número más pequeño que es múltiplo de todos ellos; por ejemplo, MCM(4, 6) = 12. El MCD se usa para simplificar fracciones y el MCM para sumarlas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si un número es primo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un número es primo si solo tiene dos divisores: 1 y él mismo. Para verificarlo, basta con comprobar que no tenga divisores entre 2 y su raíz cuadrada. Esta herramienta aplica el test de primalidad automáticamente y, si el número no es primo, muestra su factorización completa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil esta calculadora de teoría de números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para estudiantes de secundaria y universidad que trabajan con divisibilidad, fracciones o álgebra; para programadores que implementan algoritmos criptográficos (RSA, Diffie-Hellman); y para cualquier persona que necesite verificar propiedades de números enteros de forma rápida y visual.',
      },
    },
  ],
};
