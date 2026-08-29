import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sustitución de Gelatina — Hojas, Polvo y Agar-Agar | meskeIA',
  description: 'Convierte entre gelatina en hoja (bronce, plata, oro, platino), polvo y agar-agar. Equivalencias precisas por bloom strength para repostería y cocina.',
  keywords: 'sustitución gelatina, hojas gelatina, agar-agar equivalencia, bloom strength, gelatina polvo, gelatina oro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sustitución de Gelatina | meskeIA',
    description: 'Convierte entre gelatina en hoja (bronce, plata, oro, platino), polvo y agar-agar con equivalencias por bloom strength.',
    url: 'https://meskeia.com/calculadora-gelatina',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sustitución de Gelatina | meskeIA',
    description: 'Convierte entre gelatina en hoja, polvo y agar-agar con equivalencias precisas por bloom strength.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora Gelatina meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Sustitución de Gelatina',
  description: 'Calcula equivalencias entre todos los tipos de gelatina: hojas de bronce (120 bloom), plata (160), oro (200), platino (250), polvo 200 y 250, y agar-agar. Basada en el bloom strength de cada tipo.',
  url: 'https://meskeia.com/calculadora-gelatina/',
  category: 'UtilityApplication',
  features: [
    'Conversión entre 7 tipos de gelatina (4 hojas + 2 polvos + agar-agar)',
    'Resultados en gramos y número de hojas simultáneamente',
    'Advertencia sobre el comportamiento diferente del agar-agar',
    'Destaque de la gelatina hoja de oro (la más habitual en supermercados)',
    'Selector de unidad: gramos o número de hojas',
    'Tabla de equivalencias de bloom (gelatina hoja) con conversión a gramos exactos',
    'Guía sobre cuándo usar cada tipo según el postre: bavarois, panna cotta, mousses',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos gramos equivale una hoja de gelatina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tipo de hoja: la gelatina de bronce pesa aproximadamente 3,3 g por hoja (120 bloom), la de plata unos 2,5 g (160 bloom), la de oro unos 2 g (200 bloom) y la de platino unos 1,7 g (250 bloom). La más habitual en supermercados es la de oro (2 g/hoja), pero no todas las marcas lo indican en el envase.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el bloom strength en la gelatina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El bloom es una medida de la fuerza gelificante de la gelatina: a mayor número de bloom, mayor poder gelificante. Las hojas de platino (250 bloom) gelifican más que las de bronce (120 bloom), por lo que se necesita menos cantidad para lograr la misma textura. Las equivalencias entre tipos se calculan a partir de la relación entre sus valores de bloom.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo sustituir gelatina de hoja por gelatina en polvo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, son intercambiables si se usa la misma cantidad de bloom total. La gelatina en polvo más habitual es de 200 bloom (equivalente a la hoja de oro). Como referencia general, una hoja de oro (2 g, 200 bloom) equivale a 2 g de gelatina en polvo 200 bloom. La calculadora convierte automáticamente entre todos los tipos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El agar-agar puede sustituir a la gelatina en cualquier receta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No directamente. El agar-agar gelifica a temperatura ambiente y soporta el calor, mientras que la gelatina animal se derrite por encima de 35–40 °C. El agar produce texturas más firmes y quebradizas, por lo que la equivalencia en gramos es distinta (aproximadamente 1/3 o menos de la cantidad de gelatina) y el resultado final puede diferir en boca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hidrato correctamente las hojas de gelatina antes de usarlas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sumerge las hojas en agua fría (no tibia) durante 5 a 10 minutos hasta que se ablanden. Luego escúrrelas bien y añádelas a un líquido caliente (no hirviendo, entre 60 y 80 °C) removiendo hasta que se disuelvan por completo. Si el líquido está demasiado caliente, puede reducirse el poder gelificante.',
      },
    },
  ],
};
