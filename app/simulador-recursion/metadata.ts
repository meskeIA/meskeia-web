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
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Recursión | meskeIA',
    description: 'Aprende recursión con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
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
    'En español',
  ],
  keywords: ['recursión', 'pila llamadas', 'Fibonacci', 'programación'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la recursión en programación y cuándo se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recursión es una técnica en la que una función se llama a sí misma para resolver subproblemas más pequeños del mismo tipo. Tiene dos partes obligatorias: el caso base (condición que detiene las llamadas) y el caso recursivo (llamada con un problema reducido). Se usa en problemas con estructura autoimilar: recorridos de árboles y grafos, divide y vencerás (mergesort, quicksort), combinatoria y backtracking.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la pila de llamadas (call stack) en una función recursiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada vez que una función se llama a sí misma, el sistema operativo apila un nuevo frame en la call stack con los parámetros y variables locales de esa invocación. La ejecución no continúa en el frame anterior hasta que la llamada actual retorna. Si la recursión es muy profunda, se agota la memoria del stack y se produce un stack overflow. En el simulador puedes ver en tiempo real cómo los frames se apilan y se van desenrollando.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la memoización y cómo mejora la recursión de Fibonacci?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La memoización consiste en almacenar los resultados de subproblemas ya calculados para no repetir el cómputo. El Fibonacci recursivo ingénuo tiene complejidad exponencial O(2ⁿ) porque recalcula los mismos valores muchas veces (fib(30) hace más de un millón de llamadas). Con memoización la complejidad cae a O(n) porque cada valor fib(k) se calcula solo una vez y se reutiliza. El simulador muestra ambas versiones en paralelo para ver la diferencia de llamadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la solución recursiva de las Torres de Hanoi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las Torres de Hanoi con n discos se resuelven en 2ⁿ−1 movimientos mínimos. La lógica recursiva es: mover los n−1 discos superiores del palo origen al auxiliar, mover el disco más grande al destino, y mover los n−1 discos del auxiliar al destino. Esta estructura de tres subproblemas anidados ilustra perfectamente la recursión divide y vencerás y cómo una solución elegante de tres líneas realiza miles de operaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es preferible usar iteración en lugar de recursión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La iteración es preferible cuando la profundidad de la recursión puede ser muy grande (riesgo de stack overflow), cuando el rendimiento es crítico (los frames de la call stack añaden overhead), o cuando el lenguaje no implementa optimización de llamada en cola (tail-call optimization). La recursión suele preferirse cuando el problema tiene estructura recursiva natural (árboles, grafos) y la legibilidad del código importa más que el rendimiento último.',
      },
    },
  ],
};
