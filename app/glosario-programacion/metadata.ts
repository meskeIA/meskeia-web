import { Metadata } from 'next';

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
    url: 'https://meskeia.com/glosario-programacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glosario de Programación - meskeIA',
    description: 'Aprende el significado de los términos de programación más usados en desarrollo web.',
  },
  other: {
    'application-name': 'Glosario de Programación meskeIA',
  },
};
