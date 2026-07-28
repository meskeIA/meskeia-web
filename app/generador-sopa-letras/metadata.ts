import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Sopas de Letras para Imprimir (Pupiletras) | meskeIA',
  description:
    'Crea sopas de letras con tus propias palabras y descárgalas para imprimir. Elige tamaño, dirección de las palabras y nivel. Incluye solución y no requiere registro.',
  keywords:
    'generador sopa de letras, sopa de letras para imprimir, pupiletras, crear sopa de letras, buscapalabras, sopa de letras personalizada, sopa de letras con solución, actividad para niños',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Sopas de Letras (Pupiletras) para Imprimir',
    description:
      'Escribe tus palabras y obtén una sopa de letras lista para imprimir, con hoja de soluciones y tres niveles de dificultad.',
    url: 'https://meskeia.com/generador-sopa-letras',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Sopas de Letras para Imprimir',
    description: 'Tus palabras, tu cuadrícula, tu sopa de letras lista en papel.',
  },
  other: {
    'application-name': 'Generador de Sopas de Letras meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Sopas de Letras',
  description:
    'Generador de sopas de letras (pupiletras) personalizadas: introduce tu propia lista de palabras, elige el tamaño de la cuadrícula y el nivel de dificultad, y obtén una sopa lista para imprimir con su hoja de soluciones.',
  url: 'https://meskeia.com/generador-sopa-letras/',
  category: 'EducationalApplication',
  features: [
    'Lista de palabras propia o listas temáticas predefinidas',
    'Tres niveles: horizontal y vertical, con diagonales o con palabras invertidas',
    'Cuadrícula de 8×8 hasta 20×20',
    'Hoja de soluciones con las palabras resaltadas',
    'Número de sopa reproducible: el mismo número genera la misma cuadrícula',
    'Impresión optimizada en blanco y negro',
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
      name: '¿Cómo se crea una sopa de letras con mis propias palabras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se escribe la lista de palabras, una por línea, y se elige el tamaño de la cuadrícula y el nivel. El generador coloca cada palabra en la rejilla respetando los cruces por letras compartidas y rellena los huecos con letras al azar. Las palabras se normalizan automáticamente: se eliminan tildes y espacios, y la ñ se conserva como letra propia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño de cuadrícula necesito para mis palabras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuadrícula debe tener al menos tantas casillas por lado como letras tenga la palabra más larga. Como referencia práctica, una rejilla de 12×12 admite con holgura entre 10 y 14 palabras de hasta 10 letras. Si alguna palabra no cabe, el generador lo indica en pantalla en lugar de recortarla en silencio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre los tres niveles de dificultad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el nivel fácil las palabras solo aparecen de izquierda a derecha y de arriba abajo, que es lo adecuado para lectores principiantes. El nivel medio añade las dos diagonales. El nivel difícil permite además palabras escritas al revés, lo que multiplica por ocho las direcciones posibles y obliga a rastrear la cuadrícula en todos los sentidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo volver a generar exactamente la misma sopa de letras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada sopa lleva un número identificador que actúa como semilla. Si se anota ese número y se vuelve a introducir con la misma lista de palabras y los mismos ajustes, se obtiene una cuadrícula idéntica. Es útil para reimprimir una hoja perdida o repartir la misma actividad a todo un grupo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se imprime también la solución?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solución se activa con un botón y resalta cada palabra en la cuadrícula. Al imprimir se genera únicamente la vista que esté activa en pantalla, de modo que se puede imprimir primero la sopa limpia para resolver y después, si se desea, la versión con las palabras marcadas para corregir.',
      },
    },
  ],
};
