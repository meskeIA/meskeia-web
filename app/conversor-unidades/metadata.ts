import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Conversor de Unidades Científico - Longitud, Masa, Temperatura y más | meskeIA',
  description: 'Conversor de unidades completo con 13 categorías: longitud, masa, temperatura, área, volumen, tiempo, velocidad, datos, química, presión, energía, fuerza y potencia. Conversiones instantáneas y precisas.',
  keywords: 'conversor unidades, conversión metros, kilogramos, celsius fahrenheit, área, volumen, presión, energía, fuerza, potencia, química, mol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Unidades Científico | meskeIA',
    description: 'Convierte entre unidades de longitud, masa, temperatura, presión, energía y más. 13 categorías disponibles.',
    url: 'https://meskeia.com/conversor-unidades/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Unidades Científico | meskeIA',
    description: 'Convierte entre unidades de longitud, masa, temperatura, presión, energía y más.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Unidades Científico - Longitud, Masa, Temperatura y más",
  description: "Conversor de unidades completo con 13 categorías: longitud, masa, temperatura, área, volumen, tiempo, velocidad, datos, química, presión, energía, fuerza y potencia. Conversiones instantáneas y precisas.",
  url: 'https://meskeia.com/conversor-unidades/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas categorías de unidades puedo convertir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El conversor incluye 13 categorías: longitud, masa, temperatura, área, volumen, tiempo, velocidad, almacenamiento de datos, química (mol, número de partículas), presión, energía, fuerza y potencia. Cubre tanto unidades del Sistema Internacional como unidades imperiales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto grados Celsius a Fahrenheit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la categoría "Temperatura", elige Celsius como unidad de origen y Fahrenheit como unidad de destino, escribe el valor y obtendrás el resultado al instante. La fórmula aplicada es °F = (°C × 9/5) + 32.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el conversor de unidades de química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La categoría de química permite convertir entre mol, milimol, micromol y número de partículas (usando la constante de Avogadro: 6,022 × 10²³). Es útil para estudiantes de bachillerato, laboratorios y cálculos estequiométricos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los resultados son exactos o son aproximaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las conversiones usan factores de conversión definidos con alta precisión numérica. Para la mayoría de usos cotidianos y académicos el resultado es suficientemente exacto. En contextos de metrología de alta precisión se recomienda consultar tablas oficiales de la BIPM.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de los conversores integrados en buscadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los buscadores suelen ofrecer conversiones básicas (longitud, peso, temperatura). Este conversor añade categorías científicas menos comunes —presión, energía, fuerza, potencia, almacenamiento digital y química— en un único panel sin necesidad de cambiar de búsqueda.',
      },
    },
  ],
};
