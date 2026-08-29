import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Reemplazo de Páginas - FIFO LRU Optimal | meskeIA',
  description: 'Simula los algoritmos de reemplazo de páginas: FIFO, LRU, Optimal, Clock y LFU. Define una cadena de referencias y compara fallos de página, hit ratio y la anomalía de Belady. Sistemas Operativos.',
  keywords: 'reemplazo páginas, FIFO LRU Optimal Clock LFU, fallos página, page fault, anomalía Belady, sistemas operativos, memoria virtual, hit ratio, paginación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-reemplazo-paginas/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Reemplazo de Páginas | meskeIA',
    description: 'FIFO, LRU, Optimal, Clock y LFU con visualización de fallos y comparativa',
    url: 'https://meskeia.com/simulador-reemplazo-paginas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Reemplazo de Páginas | meskeIA',
    description: 'Aprende memoria virtual con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Reemplazo de Páginas',
  description: 'Simulador interactivo de algoritmos de reemplazo de páginas en memoria virtual. Define una cadena de referencias y un número de marcos, compara FIFO, LRU, Optimal, Clock y LFU, y observa fallos, anomalía de Belady y eficiencia relativa al óptimo.',
  url: 'https://meskeia.com/simulador-reemplazo-paginas/',
  category: 'EducationalApplication',
  features: [
    '5 algoritmos: FIFO, LRU, Optimal, Clock/Second Chance, LFU',
    'Tabla matricial tiempo × marco con HIT/FAULT/EVICT',
    'Modo comparativa: 5 algoritmos lado a lado',
    'Gráfica de fallos acumulados',
    '4 ejemplos clásicos (Belady, localidad alta/baja, Tanenbaum)',
    'Detección automática de anomalía de Belady',
    'En español',
  ],
  keywords: ['reemplazo páginas', 'memoria virtual', 'sistemas operativos', 'informática universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el reemplazo de páginas en sistemas operativos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reemplazo de páginas es el proceso mediante el cual el sistema operativo decide qué página de memoria física liberar cuando se produce un fallo de página y todos los marcos están ocupados. El objetivo es minimizar los fallos futuros eligiendo la página menos necesaria. Los algoritmos más estudiados son FIFO, LRU, Optimal, Clock (segunda oportunidad) y LFU.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre FIFO, LRU y el algoritmo Optimal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FIFO reemplaza la página que lleva más tiempo en memoria, independientemente de su uso reciente. LRU (Least Recently Used) reemplaza la página que no se ha referenciado hace más tiempo, aproximando el comportamiento óptimo. Optimal reemplaza la página que tardará más tiempo en volver a usarse — es el mejor posible en teoría pero impracticable en tiempo real porque requiere conocer el futuro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la anomalía de Belady y con qué algoritmo ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La anomalía de Belady es el fenómeno contraintuitivo por el que aumentar el número de marcos de memoria puede incrementar el número de fallos de página. Solo ocurre con el algoritmo FIFO; LRU y Optimal están libres de esta anomalía porque son algoritmos de pila (stack algorithms). El simulador detecta y señala automáticamente cuándo se produce.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el hit ratio en la evaluación de estos algoritmos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hit ratio es el porcentaje de referencias que encuentran la página ya cargada en memoria (aciertos frente al total de accesos). Un hit ratio alto significa menos fallos de página y mejor rendimiento del sistema. Se usa para comparar algoritmos con la misma cadena de referencias y el mismo número de marcos: cuanto más se acerca al óptimo, mejor se comporta el algoritmo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el algoritmo Clock (segunda oportunidad)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El algoritmo Clock, también llamado de segunda oportunidad, es una aproximación eficiente a LRU. Mantiene un bit de referencia por marco: cuando se accede a una página, su bit se pone a 1. Al necesitar reemplazar, el puntero recorre los marcos en orden circular; si el bit es 1 lo pone a 0 y avanza (da una segunda oportunidad); si es 0, esa página se reemplaza. Es el algoritmo más usado en sistemas reales por su bajo coste de implementación.',
      },
    },
  ],
};
