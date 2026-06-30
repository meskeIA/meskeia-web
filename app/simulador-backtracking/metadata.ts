import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Backtracking - Las N Reinas Paso a Paso | meskeIA',
  description:
    'Visualiza el algoritmo de backtracking (vuelta atrás) resolviendo el problema de las N reinas: observa cómo prueba cada posición, detecta conflictos, coloca reinas y retrocede cuando se queda sin opciones. Tablero de 4 a 8 reinas, control paso a paso y recuento de soluciones.',
  keywords:
    'backtracking, vuelta atrás, N reinas, ocho reinas, poda, árbol de búsqueda, fuerza bruta inteligente, algoritmo recursivo, conflictos diagonal, espacio de estados, algoritmia, FP informática, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-backtracking/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Backtracking: las N reinas | meskeIA',
    description: 'Prueba, conflicto, coloca y retrocede: el backtracking de las N reinas paso a paso',
    url: 'https://meskeia.com/simulador-backtracking/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Backtracking: las N reinas | meskeIA',
    description: 'El algoritmo de vuelta atrás resolviendo las N reinas, animado',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Backtracking (N Reinas)',
  description:
    'Simulador interactivo del algoritmo de backtracking (vuelta atrás) resolviendo el problema de las N reinas. Muestra paso a paso cómo prueba cada casilla, descarta las que provocan conflicto, coloca una reina y retrocede cuando una columna no tiene posiciones válidas. Permite elegir el tamaño del tablero (de 4 a 8), controlar la velocidad y ver el número total de soluciones.',
  url: 'https://meskeia.com/simulador-backtracking/',
  category: 'EducationalApplication',
  features: [
    'Problema de las N reinas con tablero de 4 a 8',
    'Backtracking animado: probar, conflicto, colocar, retroceder',
    'Control paso a paso, automático y reinicio',
    'Recuento de intentos, retrocesos y soluciones totales',
    'Resaltado de la casilla en evaluación',
    'En español',
  ],
  keywords: ['backtracking', 'vuelta atrás', 'N reinas', 'algoritmia', 'poda'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el backtracking o vuelta atrás?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El backtracking es una técnica para resolver problemas construyendo la solución paso a paso y deshaciendo (retrocediendo) la última decisión cuando esta lleva a un callejón sin salida. Explora el espacio de soluciones como un árbol: avanza mientras la solución parcial es válida y, en cuanto detecta que no puede completarse, "poda" esa rama y prueba otra. Es una fuerza bruta inteligente que evita explorar combinaciones imposibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el problema de las N reinas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Consiste en colocar N reinas en un tablero de ajedrez de N×N de forma que ninguna ataque a otra: no puede haber dos reinas en la misma fila, columna ni diagonal. El caso clásico es el de las 8 reinas en un tablero de 8×8. Se resuelve muy bien con backtracking colocando una reina por columna y retrocediendo cuando una columna se queda sin filas válidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas soluciones tiene el problema de las 8 reinas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El problema de las 8 reinas tiene 92 soluciones distintas, que se reducen a 12 si se consideran equivalentes las que son rotaciones o reflejos unas de otras. Para 4 reinas hay 2 soluciones, para 5 hay 10, para 6 hay 4 y para 7 hay 40. El simulador muestra el número total de soluciones para el tamaño de tablero que elijas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre backtracking y fuerza bruta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fuerza bruta genera todas las combinaciones posibles y luego comprueba cuáles son válidas. El backtracking comprueba la validez mientras construye la solución y abandona una rama en cuanto detecta que no puede funcionar (poda), sin generar el resto de esa rama. Por eso el backtracking explora muchísimas menos combinaciones: en las N reinas evita colocar la segunda reina en una casilla atacada en lugar de probar todo el tablero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa el backtracking en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para problemas de satisfacción de restricciones y búsqueda combinatoria: resolver sudokus y crucigramas, colorear mapas y grafos, generar permutaciones y combinaciones, encontrar caminos en laberintos, asignar horarios y recursos, y como base de muchos resolutores (solvers) de restricciones. Cuando hay que probar opciones y descartar las inviables cuanto antes, el backtracking es la herramienta natural.',
      },
    },
  ],
};
