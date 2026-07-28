import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Nonogramas o Crucigramas Japoneses para Imprimir | meskeIA',
  description:
    'Dibuja tu figura y la app calcula las pistas del nonograma (picross) y comprueba si tiene solución única por lógica. Listo para imprimir con su solución.',
  keywords:
    'generador de nonogramas, picross, crucigrama japones, nonograma para imprimir, pixel puzzle, griddler, hanjie, crear nonograma',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Nonogramas (Picross) para Imprimir',
    description:
      'Dibuja la figura, obtén las pistas y comprueba si el nonograma se puede resolver solo con lógica antes de imprimirlo.',
    url: 'https://meskeia.com/generador-nonogramas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Nonogramas para Imprimir',
    description: 'Tu dibujo convertido en crucigrama japonés, con verificación de solución única.',
  },
  other: {
    'application-name': 'Generador de Nonogramas meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Nonogramas',
  description:
    'Generador de nonogramas (también llamados picross, hanjie o crucigramas japoneses) a partir de un dibujo propio. Calcula las pistas de filas y columnas y verifica, mediante resolución por líneas, si el puzzle tiene solución única deducible por lógica antes de imprimirlo.',
  url: 'https://meskeia.com/generador-nonogramas/',
  category: 'EducationalApplication',
  features: [
    'Editor de cuadrícula con pintado por arrastre',
    'Tamaños de 5×5, 10×10 y 15×15',
    'Cálculo automático de las pistas de filas y columnas',
    'Verificación de solución única resoluble por lógica',
    'Figuras de ejemplo y relleno aleatorio con densidad ajustable',
    'Solución que se activa y desactiva antes de imprimir',
    'Impresión en blanco y negro sin elementos de la web',
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
      name: '¿Qué es un nonograma y cómo se resuelve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un nonograma, también llamado picross, hanjie o crucigrama japonés, es una cuadrícula en la que hay que pintar casillas hasta descubrir una figura. Los números de cada fila y columna indican los grupos consecutivos de casillas pintadas y su orden: un 4 2 significa cuatro seguidas, al menos un hueco, y luego dos seguidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todos los dibujos generan un nonograma válido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, y es el punto donde fallan la mayoría de los generadores. Un mismo conjunto de pistas puede admitir varios dibujos distintos, y entonces el puzzle es irresoluble sin adivinar. Por eso aquí, tras calcular las pistas, se intenta resolver el nonograma por lógica pura y se avisa si la figura no queda determinada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que sea resoluble por líneas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Significa que se puede completar analizando una fila o una columna cada vez, sin necesidad de suponer nada. El método consiste en calcular todas las colocaciones compatibles con las pistas de esa línea y marcar las casillas que coinciden en todas ellas. Los buenos nonogramas se resuelven así de principio a fin.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué figuras funcionan mejor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las siluetas compactas y con contornos claros dan puzzles resolubles y reconocibles. Las figuras muy dispersas, con casillas sueltas por toda la cuadrícula, suelen producir pistas ambiguas y un resultado que no se identifica al terminar. Como regla práctica, conviene rellenar entre el 40% y el 60% de la cuadrícula.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño conviene elegir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El de 5×5 sirve para entender el mecanismo en dos minutos y va bien con niños. El de 10×10 es el formato estándar de revista y permite figuras reconocibles con una dificultad razonable. El de 15×15 ya requiere método y paciencia, y es donde compensa marcar con cruces las casillas descartadas.',
      },
    },
  ],
};
