import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Laberintos para Imprimir | meskeIA',
  description:
    'Crea laberintos con solución única y descárgalos para imprimir. Elige tamaño, tipo de trazado y nivel. Incluye la solución y el número de laberinto para repetirlo.',
  keywords:
    'generador de laberintos, laberintos para imprimir, laberinto con solución, laberintos para niños, crear laberinto, laberinto pdf, pasatiempos imprimibles, actividad infantil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Laberintos para Imprimir',
    description:
      'Laberintos de solución única en cualquier tamaño, con dos tipos de trazado y hoja de solución. Listos para imprimir.',
    url: 'https://meskeia.com/generador-laberintos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Laberintos para Imprimir',
    description: 'Elige tamaño y trazado, y llévate el laberinto al papel con su solución.',
  },
  other: {
    'application-name': 'Generador de Laberintos meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Laberintos',
  description:
    'Generador de laberintos imprimibles con solución única garantizada. Permite elegir el tamaño de la cuadrícula y el tipo de trazado (pasillos largos o muchos desvíos), muestra la longitud del camino correcto y el número de callejones sin salida.',
  url: 'https://meskeia.com/generador-laberintos/',
  category: 'EducationalApplication',
  features: [
    'Solución única garantizada: siempre hay un camino y solo uno',
    'Dos trazados: pasillos largos o laberinto muy ramificado',
    'Tamaños de 8×8 hasta 32×32 casillas',
    'Muestra la longitud del camino y el número de callejones sin salida',
    'Solución superpuesta que se activa y desactiva',
    'Número de laberinto reproducible para reimprimir el mismo',
    'Dibujo vectorial: se imprime nítido a cualquier tamaño',
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
      name: '¿Cómo se garantiza que un laberinto tiene solución?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El laberinto se construye como un árbol que conecta todas las casillas sin formar bucles. Esa propiedad matemática implica que entre dos casillas cualesquiera existe un camino y solo uno, así que siempre hay salida y nunca hay dos rutas correctas distintas. No hace falta comprobarlo después: la forma de generarlo lo garantiza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre los dos tipos de trazado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El trazado de pasillos largos recorre la cuadrícula en profundidad y produce corredores serpenteantes con pocas bifurcaciones, en los que uno avanza mucho antes de equivocarse. El trazado ramificado crece desde muchos puntos a la vez y genera gran cantidad de desvíos cortos y callejones sin salida, lo que obliga a decidir constantemente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño de laberinto es adecuado para cada edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como referencia práctica, de 8×8 a 10×10 funciona a partir de los cuatro años, de 12×12 a 16×16 entra en el rango escolar habitual, y de 20×20 en adelante ya exige método de un adulto. Más que la edad, la señal fiable es la longitud del camino: la app la muestra en casillas junto con el número de callejones sin salida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede volver a generar el mismo laberinto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada laberinto lleva un número que actúa como semilla del generador. Introduciendo ese número con el mismo tamaño y el mismo tipo de trazado se obtiene un laberinto idéntico, lo que permite reimprimir una copia perdida o repartir exactamente la misma hoja a un grupo entero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el laberinto se imprime nítido a cualquier tamaño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El dibujo es vectorial (SVG), no una imagen de puntos, de modo que las líneas se calculan en el momento de imprimir con la resolución de la impresora. Un laberinto de 30×30 sale con paredes limpias tanto en A4 como ampliado, algo que no ocurre con las capturas de pantalla o los JPEG descargados.',
      },
    },
  ],
};
