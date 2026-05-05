import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Maderas - Directorio de 35 tipos: roble, pino, teca y más | meskeIA',
  description:
    'Directorio interactivo de 35 tipos de madera para carpintería, construcción y decoración. Dureza Janka, densidad, origen, usos y facilidad de trabajo.',
  keywords:
    'guía maderas, tipos de madera, dureza janka, roble, pino, teca, nogal, madera para muebles, madera para suelos, madera exterior, carpintería',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Maderas - Directorio Interactivo | meskeIA',
    description:
      'Explora 35 tipos de madera: frondosas, coníferas, tropicales y más. Filtra por tipo, dificultad y sostenibilidad.',
    url: 'https://meskeia.com/guia-maderas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Maderas - 35 tipos con Janka, densidad y usos',
    description:
      'Directorio interactivo de maderas: roble, pino, teca, ébano y más. Filtra y compara características.',
  },
  other: {
    'application-name': 'Guía de Maderas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Maderas',
  description:
    'Directorio interactivo de 35 tipos de madera para carpintería, construcción y decoración. Incluye dureza Janka, densidad, origen, usos principales y facilidad de trabajo para cada especie.',
  url: 'https://meskeia.com/guia-maderas/',
  features: [
    '35 tipos de madera con ficha técnica completa',
    'Filtros por tipo, dificultad y sostenibilidad',
    'Buscador por nombre de especie',
    'Escala visual de dureza Janka',
    'Información de sostenibilidad y origen',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
