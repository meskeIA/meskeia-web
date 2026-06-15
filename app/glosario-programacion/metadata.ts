import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Glosario de Programación - Términos de Desarrollo Web | meskeIA',
  description: 'Diccionario completo de términos de programación en español. Aprende el significado de API, componente, hook, props, state y más de 100 conceptos esenciales.',
  keywords: 'glosario programación, diccionario desarrollo web, términos javascript, vocabulario react, conceptos typescript, aprender programar español, terminología código, definiciones desarrollo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Glosario de Programación - Términos de Desarrollo Web',
    description: 'Diccionario completo de términos de programación en español. Más de 100 conceptos explicados de forma clara.',
    url: 'https://meskeia.com/glosario-programacion/',
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
    title: 'Glosario de Programación - meskeIA',
    description: 'Aprende el significado de los términos de programación más usados en desarrollo web.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Glosario de Programación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Glosario de Programación - Términos de Desarrollo Web",
  description: "Diccionario completo de términos de programación en español. Aprende el significado de API, componente, hook, props, state y más de 100 conceptos esenciales.",
  url: 'https://meskeia.com/glosario-programacion/',
  category: 'EducationalApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una API y para qué se usa en programación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una API (Application Programming Interface) es un conjunto de reglas y definiciones que permite a diferentes aplicaciones comunicarse entre sí. Por ejemplo, cuando una app del tiempo obtiene datos meteorológicos de un servidor externo, lo hace a través de una API. En desarrollo web, las APIs REST son las más comunes y permiten intercambiar datos en formato JSON mediante peticiones HTTP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos términos de programación incluye este glosario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El glosario recoge más de 100 conceptos esenciales del desarrollo web y la programación en general. Incluye términos de JavaScript, React, TypeScript, arquitectura de software, bases de datos y metodologías ágiles. Cada entrada explica el concepto en español con un ejemplo práctico cuando es relevante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre props y state en React?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las props (propiedades) son datos que un componente padre pasa a un componente hijo y son de solo lectura: el hijo no puede modificarlas. El state (estado) es un dato interno del propio componente que puede cambiar a lo largo del tiempo, provocando que el componente se vuelva a renderizar. Como regla general, props es para la comunicación entre componentes y state para el comportamiento interno de uno solo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este glosario de programación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para personas que están aprendiendo a programar por su cuenta o en bootcamps y se encuentran con terminología técnica en inglés que no comprenden del todo. También sirve a estudiantes de ciclos formativos de Informática y Desarrollo de Aplicaciones Web (DAW/DAM) que necesitan afianzar el vocabulario técnico en español antes de un examen o entrevista de trabajo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un framework y una librería?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia principal es quién controla el flujo de la aplicación. En una librería (como React o Lodash), el programador llama a las funciones cuando quiere. En un framework (como Angular o Django), es el framework el que define la estructura y llama al código del programador en los momentos adecuados. Este concepto se conoce como "inversión de control" o IoC.',
      },
    },
  ],
};
