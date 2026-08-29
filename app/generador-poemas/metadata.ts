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
    title: 'Generador de Poemas por Forma — meskeIA',
    description: 'Escribe haiku, soneto, romance, lira y más con guía de sílabas en tiempo real y código de colores por rima.',
    images: ['https://meskeia.com/og-image.png'],
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el generador de poemas con guía de sílabas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La herramienta muestra la estructura métrica de la forma elegida (número de sílabas por verso y esquema de rima) y, a medida que escribes, cuenta las sílabas de cada línea aplicando sinalefa automática. Un indicador de color (verde, amarillo, rojo) te avisa si el verso tiene la medida correcta, y las letras de rima (A, B, C…) aparecen codificadas por color para facilitar el seguimiento del esquema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué formas poéticas incluye la herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Incluye seis formas: haiku (5-7-5 sílabas, sin rima), redondilla (cuatro octosílabos ABBA), serventesio (cuatro endecasílabos ABAB), romance (versos octosílabos con rima asonante en pares), lira (cinco versos heptasílabos y endecasílabos aBabB) y soneto (catorce endecasílabos en dos cuartetos y dos tercetos). Cada forma incluye un ejemplo clásico y notas sobre su origen histórico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve escribir poemas siguiendo formas métricas clásicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Practicar con formas métricas desarrolla la conciencia del ritmo y la musicalidad del lenguaje, amplía el vocabulario al buscar palabras que encajen en la métrica y entrena la síntesis expresiva. Además, es útil para estudiantes de lengua y literatura que deben reconocer e imitar estas formas en exámenes, y para escritores creativos que quieran explorar la tradición poética en español.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un haiku y un soneto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El haiku es una forma japonesa de tres versos con 5, 7 y 5 sílabas respectivamente, sin rima, que busca capturar una imagen o emoción instantánea. El soneto es una forma italiana de catorce versos endecasílabos distribuidos en dos cuartetos y dos tercetos con rima consonante; su estructura permite desarrollar un argumento poético con planteamiento, desarrollo y resolución. Son dos de las formas más contrastadas en extensión, origen y propósito expresivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito conocimientos previos de métrica para usar este generador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Cada forma poética incluye una explicación de su estructura, el esquema de rima y un ejemplo clásico comentado antes de que empieces a escribir. El contador de sílabas y los indicadores de color hacen visible la métrica en tiempo real, de modo que puedes aprender el funcionamiento de cada forma mientras la practicas, sin necesidad de memorizar las reglas de antemano.',
      },
    },
  ],
};
