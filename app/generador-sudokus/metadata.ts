import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Sudokus por Dificultad para Imprimir | meskeIA',
  description:
    'Crea sudokus con solución única en cuatro niveles reales, medidos por las técnicas que hacen falta para resolverlos. Uno, dos o cuatro por hoja, con soluciones.',
  keywords:
    'generador de sudokus, sudoku para imprimir, sudoku dificil, sudoku facil, sudokus con solucion, crear sudoku, sudoku pdf, pasatiempos imprimibles',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Sudokus por Dificultad Real',
    description:
      'Sudokus de solución única clasificados por las técnicas necesarias para resolverlos, no por el número de pistas. Listos para imprimir.',
    url: 'https://meskeia.com/generador-sudokus',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Sudokus por Dificultad',
    description: 'Cuatro niveles medidos por técnica, solución única garantizada.',
  },
  other: {
    'application-name': 'Generador de Sudokus meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Sudokus por Dificultad',
  description:
    'Generador de sudokus imprimibles con solución única garantizada y dificultad medida por las técnicas de resolución que exige cada rejilla: singles, pares desnudos, candidatos apuntadores o reducción caja-línea. Permite imprimir uno, dos o cuatro sudokus por hoja con su solución.',
  url: 'https://meskeia.com/generador-sudokus/',
  category: 'EducationalApplication',
  features: [
    'Solución única garantizada: se verifica al retirar cada pista',
    'Cuatro niveles medidos por técnica necesaria, no por número de pistas',
    'El nivel difícil es el que obliga a anotar candidatos en la rejilla',
    'Indica qué técnicas hacen falta para resolver cada rejilla',
    'Uno, dos o cuatro sudokus por hoja',
    'Simetría rotacional opcional en la disposición de las pistas',
    'Soluciones que se activan y desactivan antes de imprimir',
    'Número de sudoku reproducible para reimprimir el mismo',
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
      name: '¿El número de pistas determina la dificultad de un sudoku?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, es el error más extendido. Un sudoku con 30 pistas puede resolverse solo con singles y otro con 32 exigir pares ocultos. Lo que marca la dificultad es la técnica más avanzada que hace falta emplear, y por eso aquí cada rejilla se resuelve lógicamente antes de clasificarla, en lugar de contar las casillas rellenas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué técnicas exige cada nivel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El corte entre niveles es el que nota quien resuelve. El fácil se completa con singles desnudos: casillas que solo admiten un valor y se ven de un vistazo. El medio exige singles ocultos, es decir, escanear cada valor por región. El difícil obliga a anotar candidatos para aplicar pares desnudos, candidatos apuntadores, pares ocultos o reducción caja-línea. El experto no se resuelve con ninguna de esas seis técnicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se garantiza que hay una sola solución?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de una rejilla completa y válida y se van retirando pistas de una en una. Antes de aceptar cada retirada se cuentan las soluciones de la rejilla resultante, y si aparece más de una, la pista se devuelve a su sitio. Un sudoku con dos soluciones no es un sudoku: obliga a adivinar y no se puede corregir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas pistas mínimas necesita un sudoku válido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está demostrado desde 2012 que no existe ningún sudoku de solución única con 16 pistas o menos: el mínimo es 17. Aun así, las rejillas de 17 pistas son rarísimas y no necesariamente las más difíciles para una persona; los sudokus de nivel experto habituales se mueven entre 22 y 26 pistas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el número de sudoku?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Actúa como semilla del generador: introduciéndolo de nuevo con el mismo nivel y los mismos ajustes se obtiene exactamente la misma rejilla. Sirve para reimprimir una hoja perdida, repartir el mismo sudoku a varias personas y compararlo, o recuperar la solución de un pasatiempo que se empezó hace semanas.',
      },
    },
  ],
};
