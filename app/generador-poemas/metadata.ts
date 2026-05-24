import { generateWebAppSchema } from '@/lib/schema-templates';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Poemas por Forma | Haiku, Soneto, Romance y Más — meskeIA',
  description:
    'Escribe poemas guiado por la estructura métrica clásica: haiku, redondilla, serventesio, romance, lira y soneto. Contador de sílabas en tiempo real y código de colores por grupo de rima.',
  keywords: [
    'generador de poemas',
    'formas poéticas',
    'haiku',
    'soneto',
    'romance',
    'lira',
    'redondilla',
    'serventesio',
    'contador sílabas',
    'métrica poética',
    'escritura creativa',
    'poesía española',
  ],
  openGraph: {
    title: 'Generador de Poemas por Forma — meskeIA',
    description:
      'Escribe haiku, soneto, romance, lira y más con guía de sílabas en tiempo real y código de colores por rima.',
    url: 'https://meskeia.com/generador-poemas/',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Poemas por Forma',
  description:
    'Herramienta interactiva para escribir poemas siguiendo formas métricas clásicas. Incluye haiku, redondilla, serventesio, romance, lira y soneto, con contador de sílabas en tiempo real y código de colores por grupo de rima.',
  url: 'https://meskeia.com/generador-poemas/',
  category: 'EducationalApplication',
  features: [
    '6 formas poéticas: haiku, redondilla, serventesio, romance, lira y soneto',
    'Contador de sílabas en tiempo real con sinalefa automática',
    'Código de colores por grupo de rima (A, B, C, D)',
    'Indicadores verde/amarillo/rojo según precisión métrica',
    'Ejemplos clásicos para cada forma poética',
    'Consejos específicos y origen histórico de cada forma',
    'Botón de copia para exportar el poema al portapapeles',
    'Separadores visuales de estrofa para soneto y lira',
  ],
});
