import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Focales: 14, 24, 50, 85 y 200 mm Comparados | meskeIA',
  description: 'Compara visualmente cómo cambia la perspectiva con 14, 24, 50, 85 y 200 mm. Toggle Full Frame / APS-C / Micro 4/3 con equivalente FF y ángulo de visión.',
  keywords: 'visualizador focales fotografía, distancia focal cámara, 14mm 24mm 50mm 85mm 200mm, gran angular teleobjetivo normal, perspectiva fotográfica, factor de recorte APS-C Micro 4/3, equivalente full frame, ángulo de visión cámara',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Focales Fotográficas',
    description: 'Comparativa visual lado a lado de las distancias focales clásicas. Entiende qué objetivo elegir y cómo afecta el factor de recorte de tu sensor.',
    url: 'https://meskeia.com/visualizador-focales-fotografia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Focales Fotográficas',
    description: 'Comparativa de 14/24/50/85/200 mm con toggle de sensor. Aprende qué objetivo elegir.',
  },
  other: {
    'application-name': 'Visualizador de Focales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Focales Fotográficas',
  description: 'Herramienta interactiva que muestra simultáneamente la misma escena renderizada a 14, 24, 50, 85 y 200 mm. Permite ver cómo cambia la perspectiva (no el zoom) según la focal y cómo el factor de recorte del sensor (Full Frame, APS-C, Micro 4/3) afecta al ángulo de visión y al equivalente Full Frame.',
  url: 'https://meskeia.com/visualizador-focales-fotografia/',
  category: 'EducationalApplication',
  features: [
    'Comparativa simultánea lado a lado de 5 focales clásicas: 14, 24, 50, 85 y 200 mm',
    '3 escenas seleccionables: retrato urbano, paisaje y animal',
    'Toggle entre 3 tamaños de sensor: Full Frame, APS-C (×1,5) y Micro 4/3 (×2,0)',
    'Indicador de ángulo de visión y equivalente Full Frame para cada combinación',
    'Visualiza la "compresión de perspectiva" del teleobjetivo y la apertura del gran angular',
    'Tabla comparativa completa de focales, ángulos y usos típicos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});
