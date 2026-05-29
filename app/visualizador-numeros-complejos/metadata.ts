import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Números Complejos: El Plano de Argand y e^(iπ)+1=0 | meskeIA',
  description: 'Visualiza los números complejos como geometría. Plano de Argand interactivo, operaciones como rotaciones, forma polar, fórmula de Euler y la identidad más bella de las matemáticas.',
  keywords: [
    'números complejos',
    'plano de Argand',
    'fórmula de Euler',
    'número imaginario i',
    'e elevado a i pi',
    'transformada de Fourier',
    'circuitos AC impedancia',
    'forma polar complejo',
  ],
  openGraph: {
    title: 'Números Complejos: El Plano de Argand y e^(iπ)+1=0',
    description: 'Multiplicar números complejos es rotar y escalar. Descúbrelo en el plano de Argand interactivo.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Números Complejos: El Plano de Argand",
  description: "Visualiza los números complejos como geometría. Plano de Argand interactivo, operaciones como rotaciones, forma polar, fórmula de Euler y la identidad más bella de las matemáticas.",
  url: "https://meskeia.com/visualizador-numeros-complejos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un número complejo y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un número complejo tiene la forma a + bi, donde a es la parte real y b la parte imaginaria, con i = √(−1). Son esenciales en ingeniería eléctrica (impedancias AC), procesamiento de señales (transformada de Fourier), mecánica cuántica y muchas ramas de la física matemática. Amplían los números reales para resolver ecuaciones como x² + 1 = 0, que no tienen solución en los reales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el plano de Argand y cómo se representan los números complejos en él?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plano de Argand (o plano complejo) es un sistema de coordenadas donde el eje horizontal representa la parte real y el eje vertical la parte imaginaria. Cada número complejo a + bi se representa como el punto (a, b). Esta representación geométrica revela que multiplicar por i equivale a una rotación de 90° y que el módulo del número es su distancia al origen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la identidad de Euler e^(iπ) + 1 = 0?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La identidad de Euler e^(iπ) + 1 = 0 relaciona en una sola ecuación los cinco números más importantes de las matemáticas: e (base del logaritmo natural ≈ 2,718), i (unidad imaginaria), π (≈ 3,1416), 1 (elemento neutro del producto) y 0 (elemento neutro de la suma). Se deduce de la fórmula de Euler e^(iθ) = cos θ + i·sin θ evaluada en θ = π.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la forma polar de un número complejo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma polar expresa un número complejo como r·e^(iθ), donde r es el módulo (distancia al origen) y θ el argumento (ángulo con el eje real positivo). Esta representación simplifica enormemente la multiplicación y la potenciación: multiplicar dos complejos equivale a sumar sus ángulos y multiplicar sus módulos. Es la base del teorema de De Moivre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil este visualizador de números complejos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El visualizador es útil desde el bachillerato científico-tecnológico y primeros cursos universitarios de ingeniería, física o matemáticas. Permite explorar de forma intuitiva conceptos que normalmente se presentan de manera abstracta: ver la multiplicación como rotación o entender la fórmula de Euler geométricamente ayuda a consolidar la comprensión antes de trabajar con álgebra formal.',
      },
    },
  ],
};
