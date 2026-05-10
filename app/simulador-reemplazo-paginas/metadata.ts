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
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Reemplazo de Páginas | meskeIA',
    description: 'Aprende memoria virtual con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['reemplazo páginas', 'memoria virtual', 'sistemas operativos', 'informática universidad'],
});
