import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Tipos de Arroz del Mundo | meskeIA',
  description:
    'Guía de referencia de 30 variedades de arroz: basmati, jazmín, bomba, arborio, sushi y más. Tipo de grano, origen, cocción y uso ideal.',
  keywords: [
    'tipos de arroz',
    'variedades arroz',
    'basmati jazmin bomba',
    'arborio carnaroli risotto',
    'arroz sushi',
    'como cocinar arroz',
    'arroz paella',
  ],
  openGraph: {
    title: 'Guía de Tipos de Arroz del Mundo | meskeIA',
    description:
      'Guía de referencia de 30 variedades de arroz del mundo: tipo de grano, origen, tiempo de cocción, proporción de agua y uso culinario ideal.',
    type: 'website',
    url: 'https://meskeia.com/guia-tipos-arroz/',
    locale: 'es_ES',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Tipos de Arroz del Mundo',
    description:
      'Aprende a elegir el arroz correcto para cada plato: 30 variedades del mundo, su origen, características y uso ideal.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-tipos-arroz',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Tipos de Arroz",
  description: "Guía de referencia de 30 variedades de arroz: basmati, jazmín, bomba, arborio, sushi y más. Tipo de grano, origen, cocción y uso ideal.",
  url: "https://meskeia.com/guia-tipos-arroz/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué arroz se usa para hacer paella?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para paella se usan variedades de grano redondo con alta capacidad de absorción, principalmente el arroz bomba (Denominación de Origen Valencia y Murcia), el senia y el bahía. El arroz bomba es el más valorado porque absorbe el doble de caldo que su volumen sin abrirse, manteniendo el grano entero y suelto. No se recomienda usar arroz de grano largo como el basmati, ya que no absorbe bien el sabor del caldo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre arroz basmati y arroz jazmín?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El arroz basmati, originario de India y Pakistán, tiene un grano largo y fino con aroma a nuez y textura seca y suelta tras la cocción. El arroz jazmín, proveniente de Tailandia, también es aromático pero tiene un grano ligeramente más corto y pegajoso. El basmati es ideal para currys y biryanis; el jazmín encaja mejor con cocinas del sudeste asiático como la tailandesa o vietnamita.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué arroz se necesita para hacer risotto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El risotto requiere variedades de grano corto o medio con alto contenido en almidón, especialmente arborio y carnaroli. El carnaroli es considerado el más profesional por su capacidad de liberar almidón lentamente, dando cremosidad sin deshacerse. El arborio, más fácil de encontrar, también funciona bien. Ambos se originan en el norte de Italia (Piamonte, Lombardía) y no deben lavarse antes de cocinar para conservar el almidón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua necesita el arroz para cocinarlo bien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La proporción agua/arroz varía según la variedad. El arroz de grano largo (basmati, jazmín) necesita aproximadamente 1,5-1,75 partes de agua por parte de arroz. El arroz de grano corto para sushi usa 1,1-1,2 partes de agua. El arroz bomba para paella absorbe hasta 3 partes de caldo. El arroz integral requiere más agua (2-2,5 partes) y más tiempo de cocción que el blanco equivalente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una guía de variedades de arroz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con más de 40.000 variedades de arroz registradas en el mundo, elegir la correcta para cada plato marca la diferencia entre un resultado óptimo y uno mediocre. Una guía de variedades permite conocer el tipo de grano (largo, medio, corto), el origen geográfico, la proporción de agua correcta y el uso culinario ideal de cada variedad. Es especialmente útil para sustituir una variedad cuando no está disponible o para explorar cocinas asiáticas, mediterráneas o latinoamericanas.',
      },
    },
  ],
};
