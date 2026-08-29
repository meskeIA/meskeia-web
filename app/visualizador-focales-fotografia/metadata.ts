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
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Focales Fotográficas',
    description: 'Comparativa de 14/24/50/85/200 mm con toggle de sensor. Aprende qué objetivo elegir.',
    images: ['https://meskeia.com/og-image.png'],
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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una focal de 24 mm y una de 85 mm en fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una focal de 24 mm es un gran angular que captura un campo de visión muy amplio (84° en Full Frame), ideal para paisajes y arquitectura. Una focal de 85 mm es un teleobjetivo corto con un ángulo de 28°, perfecto para retratos porque comprime levemente la perspectiva y aleja al fotógrafo del modelo. Cuanto mayor es la focal, más estrecho es el ángulo y más "comprimida" parece la escena.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el factor de recorte APS-C al ángulo de visión de mis objetivos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los sensores APS-C tienen un factor de recorte de ×1,5 (Nikon, Sony, Fuji) o ×1,6 (Canon). Esto significa que un objetivo de 50 mm montado en una cámara APS-C se comporta como un 75-80 mm en Full Frame: el ángulo de visión se reduce y el sujeto parece más cercano. Para recuperar el mismo encuadre que en Full Frame necesitas usar una focal más corta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué focal equivale a la visión humana en fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Convencionalmente se considera que 50 mm en Full Frame equivale aproximadamente a la visión humana porque reproduce la perspectiva de forma natural, sin exagerar la profundidad ni la compresión. En la práctica, el ojo humano tiene un ángulo de visión central de unos 40-50°, que coincide con los 46° de un objetivo de 50 mm en Full Frame.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un objetivo de 14 mm y cuándo usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un objetivo de 14 mm es un gran angular extremo con un ángulo de visión de unos 114° en Full Frame. Se usa principalmente para fotografía de paisaje, arquitectura de interiores, astrofotografía (captura grandes zonas del cielo) y fotografía reportaje en espacios reducidos. Su característica principal es la distorsión en perspectiva: los objetos cercanos parecen muy grandes y los lejanos muy pequeños.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la "compresión de perspectiva" que produce el teleobjetivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La compresión de perspectiva es el efecto visual por el que los planos lejanos parecen más cercanos entre sí cuando se fotografía con una focal larga (100 mm o más). Ocurre porque el fotógrafo se aleja del sujeto para encuadrarlo, y desde esa distancia las diferencias de distancia entre objetos se perciben proporcionalmente menores. Este efecto se usa en retratos para acercar el fondo al modelo y en deportes para hacer que los atletas parezcan más juntos.',
      },
    },
  ],
};
