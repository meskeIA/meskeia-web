import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Cartones de Bingo para Imprimir + Bombo | meskeIA',
  description:
    'Crea cartones de bingo únicos y numerados para imprimir, en las dos modalidades: 90 bolas (3×9) y 75 bolas (5×5). Incluye bombo digital con historial de números cantados.',
  keywords:
    'generador cartones de bingo, cartones de bingo para imprimir, bingo 90 bolas, bingo 75 bolas, bombo de bingo online, bingo casero, cartones bingo gratis, bingo navidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Cartones de Bingo + Bombo Digital',
    description:
      'Cartones únicos listos para imprimir en las modalidades de 90 y 75 bolas, con bombo digital y control de los números cantados.',
    url: 'https://meskeia.com/generador-cartones-bingo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Cartones de Bingo para Imprimir',
    description: 'Cartones únicos, numerados y con bombo digital incluido.',
  },
  other: {
    'application-name': 'Generador de Cartones de Bingo meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Cartones de Bingo',
  description:
    'Generador de cartones de bingo imprimibles en las dos modalidades habituales: 90 bolas con cartón de 3 filas por 9 columnas y 75 bolas con cartón de 5×5 y casilla libre central. Incluye bombo digital con historial de números cantados.',
  url: 'https://meskeia.com/generador-cartones-bingo/',
  category: 'UtilityApplication',
  features: [
    'Dos modalidades: 90 bolas (3×9) y 75 bolas (5×5 con casilla libre)',
    'Hasta 40 cartones únicos y numerados por tirada',
    'Cartones válidos: respetan el reparto por columnas y los 15 números por cartón',
    'Bombo digital con historial y panel de números cantados',
    'Número de partida reproducible para reimprimir los mismos cartones',
    'Impresión optimizada: dos cartones por fila y sin fondos de color',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el bingo de 90 bolas y el de 75?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bingo de 90 bolas, habitual en España y buena parte de Europa, usa cartones de 3 filas por 9 columnas con 15 números y se juega a línea y bingo. El de 75 bolas, extendido en América, usa un cartón de 5×5 con una casilla libre en el centro y admite figuras: línea, cruz, cuatro esquinas o cartón lleno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se construye un cartón de bingo válido de 90 bolas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada columna cubre una decena: la primera va del 1 al 9, la segunda del 10 al 19 y así hasta la novena, que llega del 80 al 90. Un cartón válido tiene exactamente 15 números, cinco por fila y cuatro huecos en cada una, y ninguna columna puede quedar vacía ni superar los tres números.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los cartones generados son distintos entre sí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Antes de añadir un cartón a la tirada se compara con los ya generados y se descarta si coincide. Con 90 números la cantidad de combinaciones posibles es enorme, de modo que en una tirada normal de veinte o treinta cartones no hay repeticiones ni cartones casi idénticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo reimprimir exactamente los mismos cartones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada tirada lleva un número de partida que actúa como semilla. Introduciendo ese número con la misma modalidad y la misma cantidad de cartones se obtiene el mismo juego, algo necesario si alguien pierde su cartón a mitad de partida o si se quiere repetir la sesión otro día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El bombo digital sustituye a las bolas físicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cumple la misma función: extrae números sin repetición y guarda el historial completo de lo cantado, que es justo lo que se pierde con un bombo casero cuando alguien reclama línea y hay que comprobar. Los números salen en pantalla, así que conviene que quien canta sea una sola persona y el resto juegue con el cartón impreso.',
      },
    },
  ],
};
