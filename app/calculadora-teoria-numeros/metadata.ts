import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Teoría de Números - Primos, MCD, MCM | meskeIA',
  description: 'Factoriza en primos, calcula MCD y MCM y encuentra todos los divisores de un número. Te dice además si es un antiprimo: si tiene más divisores que cualquier número menor que él, como 12, 60, 360 o 5040.',
  keywords: 'divisores de un número, antiprimos, números altamente compuestos, números primos, factorización, MCD, MCM, teoría de números, criba, Euclides',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Teoría de Números | meskeIA',
    description: 'Números primos, factorización, MCD, MCM, divisores y antiprimos.',
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
  features: [
    'Divisores de un número, con sus pares complementarios y su suma',
    'Detecta si el número es un antiprimo (número altamente compuesto) y por qué',
    'Salta al antiprimo anterior y al siguiente para comparar la serie',
    'Verificación de primalidad y criba de Eratóstenes por rangos',
    'Factorización en factores primos',
    'MCD y MCM de hasta tres números por el algoritmo de Euclides',
    'Aritmética modular: residuo, potencia modular, función φ de Euler e inverso',
    'Gratuito, en español y sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un número antiprimo o altamente compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un número es antiprimo —altamente compuesto, en su nombre formal— cuando tiene más divisores que cualquier número menor que él. 12 tiene 6 divisores y ninguno de los once anteriores llega a 6, así que 12 es antiprimo; 40 tiene 8, pero 24 ya llegaba a 8 siendo menor, así que no lo es. Empatar no basta: hay que superar el récord. La serie empieza 1, 2, 4, 6, 12, 24, 36, 48, 60, 120, 180, 240, 360 y sigue sin fin. Ramanujan la estudió en 1915 y acuñó el término «highly composite number».',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la hora tiene 60 minutos y el círculo 360 grados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque 60 y 360 son antiprimos: tienen 12 y 24 divisores respectivamente, más que cualquier número menor. Eso permite partir la hora en mitades, tercios, cuartos, quintos y sextos con minutos enteros, y el círculo en muchísimas fracciones con grados enteros; con 100 minutos, el tercio de hora no existiría. El sistema sexagesimal viene de Babilonia y la comodidad para dividir es la explicación que más se repite, aunque los historiadores debaten cuánto pesó frente a otros rasgos de su forma de contar.',
      },
    },
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
