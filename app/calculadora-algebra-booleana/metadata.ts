import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Álgebra Booleana con Mapas de Karnaugh | meskeIA',
  description: 'Simplifica expresiones booleanas con mapas de Karnaugh de 2, 3 y 4 variables. Tablas de verdad, don\'t cares y forma mínima SOP/POS garantizada por Quine-McCluskey, con los implicantes primos esenciales marcados.',
  keywords: 'álgebra booleana, mapa de karnaugh, k-map, tabla de verdad, simplificación, SOP, POS, mintérminos, maxtérminos, implicantes primos esenciales, quine-mccluskey, lógica digital, circuitos digitales, universidad, ingeniería',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Álgebra Booleana con Karnaugh | meskeIA',
    description: 'Simplifica expresiones booleanas con mapas de Karnaugh. Tablas de verdad, forma mínima SOP/POS y visualización de agrupaciones.',
    url: 'https://meskeia.com/calculadora-algebra-booleana/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Álgebra Booleana con Karnaugh | meskeIA',
    description: 'Simplifica expresiones booleanas con mapas de Karnaugh.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Álgebra Booleana meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Álgebra Booleana con Mapas de Karnaugh",
  description: "Simplifica expresiones booleanas con mapas de Karnaugh de 2, 3 y 4 variables. Tablas de verdad, don't cares y forma mínima SOP/POS calculada por Quine-McCluskey, con los implicantes primos esenciales marcados sobre el mapa.",
  url: 'https://meskeia.com/calculadora-algebra-booleana/',
  category: 'EducationalApplication',
  features: [
    'Mapas de Karnaugh de 2, 3 y 4 variables con visualización de grupos en colores',
    'Minimización exacta por Quine-McCluskey: la expresión con menos términos y menos literales',
    'Implicantes primos esenciales marcados, y los descartados por redundantes a la vista',
    'Forma mínima en SOP (suma de productos) y POS (producto de sumas)',
    'Tabla de verdad completa e interactiva: activa/desactiva celdas con un clic',
    'Soporte de celdas don\'t care (X) para simplificaciones con condiciones de indiferencia',
    'Ejemplos predefinidos: XOR, votación por mayoría, paridad y BCD inválido',
    'Proceso paso a paso: mintérminos, implicantes primos, cobertura mínima y expresión final',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un mapa de Karnaugh y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un mapa de Karnaugh (K-map) es una herramienta gráfica para simplificar expresiones de álgebra booleana. Organiza los mintérminos en una cuadrícula de forma que las celdas adyacentes difieren en un solo bit, lo que permite identificar visualmente grupos simplificables. Se usa en diseño de circuitos digitales para reducir el número de puertas lógicas necesarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la forma SOP y la forma POS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SOP (Sum of Products, suma de productos) es una expresión booleana formada como OR de términos AND; se obtiene agrupando los mintérminos (celdas con valor 1) en el mapa de Karnaugh. POS (Product of Sums, producto de sumas) es su dual: AND de términos OR, obtenido agrupando los maxtérminos (celdas con valor 0). Ambas formas son equivalentes lógicamente, pero una puede resultar más simple que la otra según la función.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para cuántas variables funciona esta calculadora de álgebra booleana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora soporta mapas de Karnaugh de 2, 3 y 4 variables. Con 2 variables se trabaja con 4 mintérminos; con 3 variables, 8; con 4 variables, 16. La mayoría de los ejercicios de universidad y bachillerato tecnológico cubren hasta 4 variables, que es el límite práctico del método gráfico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un implicante primo esencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un implicante primo es un grupo que ya no se puede agrandar sin incluir ceros. Es esencial cuando es el único que cubre algún mintérmino: entonces tiene que aparecer sí o sí en la expresión mínima. El resto de mintérminos se cubren eligiendo entre los implicantes primos no esenciales, y ahí es donde dos personas pueden llegar a expresiones distintas igual de cortas. La calculadora marca cuáles son esenciales y cuáles descarta por redundantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La expresión que devuelve es realmente la mínima?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En lugar de ir tomando los grupos más grandes uno a uno (heurística que suele dejar términos de sobra), la calculadora obtiene todos los implicantes primos por el algoritmo de Quine-McCluskey y después resuelve la cobertura mínima: no existe otra expresión con menos términos, ni con los mismos términos y menos literales. Con 4 variables, casi la mitad de las funciones tienen soluciones aparentemente válidas pero no mínimas, así que la diferencia se nota al corregir un ejercicio.',
      },
    },
  ],
};
