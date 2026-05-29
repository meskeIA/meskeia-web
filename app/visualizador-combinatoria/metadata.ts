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
    url: 'https://meskeia.com/visualizador-combinatoria/',
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
    title: 'Combinatoria: Permutaciones, Combinaciones y Pascal — meskeIA',
    description: 'Explora la combinatoria con árboles animados, triángulo de Pascal y binomio de Newton de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre permutaciones y combinaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En las permutaciones el orden importa: P(n,k) = n!/(n−k)! cuenta las maneras de ordenar k elementos de n posibles. En las combinaciones el orden no importa: C(n,k) = n!/(k!·(n−k)!) cuenta solo los grupos sin tener en cuenta cómo se ordenan. Por ejemplo, elegir 2 letras de {A,B,C}: hay 6 permutaciones pero solo 3 combinaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué patrones ocultos tiene el triángulo de Pascal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El triángulo de Pascal esconde múltiples patrones: la suma de cada fila es una potencia de 2 (1, 2, 4, 8…); las diagonales inclinadas contienen los números de Fibonacci; coloreando los números impares emerge el fractal de Sierpinski; y las filas coinciden con los coeficientes del binomio de Newton (a+b)ⁿ.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el principio de multiplicación en combinatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio de multiplicación establece que si una tarea tiene k pasos independientes con n₁, n₂, …, nₖ opciones respectivamente, el número total de maneras de completarla es n₁ × n₂ × … × nₖ. Por ejemplo, si hay 3 camisetas y 4 pantalones, hay 3 × 4 = 12 combinaciones de ropa posibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el binomio de Newton?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El binomio de Newton permite expandir (a+b)ⁿ sin multiplicar repetidamente: (a+b)ⁿ = Σ C(n,k)·aⁿ⁻ᵏ·bᵏ. Los coeficientes son exactamente la fila n-ésima del triángulo de Pascal. Se aplica en probabilidad (distribución binomial), criptografía, cálculo de potencias grandes y álgebra simbólica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se usa la combinatoria en la vida real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La combinatoria está detrás de muchos sistemas cotidianos: la probabilidad de acertar en la lotería, el número de contraseñas posibles con ciertos caracteres, los algoritmos de ordenación y búsqueda en informática, el diseño de experimentos científicos y las estrategias en juegos de cartas o ajedrez. También es la base matemática de la teoría de grafos y la criptografía.',
      },
    },
  ],
};
