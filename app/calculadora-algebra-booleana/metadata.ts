import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Álgebra Booleana con Mapas de Karnaugh | meskeIA',
  description: 'Simplifica expresiones booleanas usando mapas de Karnaugh de 2, 3 y 4 variables. Genera tablas de verdad, obtén la forma mínima SOP/POS y visualiza las agrupaciones.',
  keywords: 'álgebra booleana, mapa de karnaugh, k-map, tabla de verdad, simplificación, SOP, POS, mintérminos, maxtérminos, lógica digital, circuitos digitales, universidad, ingeniería',
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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Álgebra Booleana con Karnaugh | meskeIA',
    description: 'Simplifica expresiones booleanas con mapas de Karnaugh.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Álgebra Booleana meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Álgebra Booleana con Mapas de Karnaugh",
  description: "Simplifica expresiones booleanas usando mapas de Karnaugh de 2, 3 y 4 variables. Genera tablas de verdad, obtén la forma mínima SOP/POS y visualiza las agrupaciones.",
  url: 'https://meskeia.com/calculadora-algebra-booleana/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
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
      name: '¿Cómo se introducen los mintérminos en la calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes seleccionar directamente las celdas del mapa haciendo clic sobre ellas, o introducir la lista de mintérminos (números decimales separados por coma) en el campo de texto. La calculadora actualiza automáticamente la tabla de verdad, identifica las agrupaciones óptimas y muestra la expresión mínima resultante en formato SOP y POS.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia esta herramienta de otros simplificadores booleanos en línea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Además de calcular la expresión mínima, esta herramienta visualiza las agrupaciones sobre el propio mapa de Karnaugh con colores diferenciados, genera la tabla de verdad completa y muestra tanto la forma SOP como la POS. Funciona completamente en el navegador sin necesidad de registro, instalación ni conexión a una API externa.',
      },
    },
  ],
};
