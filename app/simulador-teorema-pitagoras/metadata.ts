import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// Lenguaje Latam-friendly: el término núcleo («teorema de Pitágoras», «hipotenusa»,
// «cateto») es universal en todo el español, así que el H1 no necesita variantes. Lo que
// sí cambia de un país a otro es el DESCRIPTOR DE AUDIENCIA (ESO/bachillerato frente a
// secundaria/preparatoria/educación media): por eso aquí se usan las formas neutras y
// aditivas, y nunca en el H1.

export const metadata: Metadata = {
  title: 'Teorema de Pitágoras: Calcular Hipotenusa y Catetos con Ejercicios | meskeIA',
  description:
    'Calcula la hipotenusa o el cateto que falta con los pasos escritos, mira la demostración visual con los tres cuadrados y practica con 12 casos numerados y ejercicios aleatorios.',
  keywords:
    'teorema de pitágoras, calcular hipotenusa, calcular cateto, triángulo rectángulo, demostración visual pitágoras, terna pitagórica, recíproco del teorema de pitágoras, ejercicios de pitágoras, diagonal de un rectángulo, pitágoras en 3D, secundaria, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Teorema de Pitágoras: calcula, demuestra y practica',
    description:
      'Sliders para ver cómo cambia la hipotenusa, los tres cuadrados de la demostración clásica, resolución paso a paso y 12 casos numerados con corrección automática.',
    url: 'https://meskeia.com/simulador-teorema-pitagoras/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simulador del teorema de Pitágoras',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teorema de Pitágoras: calculadora visual y ejercicios',
    description:
      'Hipotenusa, catetos, demostración visual con los tres cuadrados y 12 casos numerados para practicar.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Simulador del Teorema de Pitágoras meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Teorema de Pitágoras',
  description:
    'Simulador interactivo del teorema de Pitágoras: calcula la hipotenusa o el cateto que falta mostrando cada paso, muestra la demostración visual con los cuadrados construidos sobre los tres lados, comprueba el recíproco y las ternas pitagóricas, y ofrece 12 casos numerados con corrección automática y ejercicios aleatorios ilimitados.',
  url: 'https://meskeia.com/simulador-teorema-pitagoras/',
  category: 'EducationalApplication',
  features: [
    'Triángulo rectángulo interactivo con sliders para los dos catetos',
    'Demostración visual con los cuadrados construidos sobre cada lado y sus áreas',
    'Resolución paso a paso de la hipotenusa o del cateto que falta',
    'Recíproco del teorema: comprueba si tres lados forman un triángulo rectángulo',
    'Detección de ternas pitagóricas y de ternas primitivas',
    '12 casos numerados fijos, iguales para todo el mundo, con corrección automática',
    'Generador de ejercicios aleatorios ilimitados con solución explicada',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula del teorema de Pitágoras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En todo triángulo rectángulo se cumple c² = a² + b², donde c es la hipotenusa (el lado opuesto al ángulo recto, siempre el más largo) y a y b son los catetos. Para hallar la hipotenusa se suman los cuadrados de los catetos y se saca la raíz: c = √(a² + b²). Con catetos de 3 y 4, la hipotenusa vale exactamente 5.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula un cateto si conozco la hipotenusa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se despeja restando: b = √(c² − a²). El orden importa, porque la resta no es conmutativa: siempre se resta el cuadrado del cateto conocido al cuadrado de la hipotenusa, nunca al revés. Si la hipotenusa que has escrito no es el lado mayor, la operación daría la raíz de un número negativo, y eso indica que los datos están intercambiados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una terna pitagórica y cuáles son las más frecuentes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una terna pitagórica son tres números enteros que cumplen exactamente a² + b² = c², de modo que el triángulo es rectángulo y sus tres lados son enteros. Las más habituales en los ejercicios son 3-4-5, 5-12-13, 8-15-17, 7-24-25 y 20-21-29. Una terna es primitiva cuando sus tres números no comparten ningún divisor común: 6-8-10 es terna, pero no primitiva, porque es 3-4-5 multiplicada por dos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si un triángulo es rectángulo conociendo sus tres lados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es el recíproco del teorema: se ordenan los tres lados de menor a mayor y se comprueba si la suma de los cuadrados de los dos menores es igual al cuadrado del mayor. Si la suma es mayor que ese cuadrado, el triángulo es acutángulo; si es menor, es obtusángulo. Antes conviene verificar la desigualdad triangular, porque con longitudes como 1, 2 y 10 no se puede cerrar ningún triángulo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede aplicar el teorema de Pitágoras en tres dimensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, aplicándolo dos veces seguidas. Para la diagonal de una caja se calcula primero la diagonal del fondo con los dos lados de la base, y después se usa esa diagonal junto con la altura como catetos de un segundo triángulo rectángulo. El resultado equivale a la fórmula compacta D = √(largo² + ancho² + alto²): en una caja de 60 por 25 por 20 cm, la varilla más larga que cabe mide unos 68,01 cm.',
      },
    },
  ],
};
