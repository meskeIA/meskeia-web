import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Aditivos E Alimentarios - Qué son y para qué sirven | meskeIA',
  description: 'Consulta los 90 aditivos E más comunes en los alimentos: código, nombre, categoría, origen y función. Busca por nombre o filtra por tipo. Información oficial EFSA.',
  keywords: 'aditivos alimentarios, códigos E, conservantes, colorantes, emulsionantes, antioxidantes, etiquetas alimentos, EFSA, aditivos E números',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Aditivos E Alimentarios | meskeIA',
    description: 'Busca y consulta los aditivos E más comunes: qué son, de dónde vienen y en qué alimentos los encontrarás.',
    url: 'https://meskeia.com/aditivos-e-alimentarios',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Aditivos E Alimentarios | meskeIA',
    description: 'Consulta los 90 aditivos E más comunes: código, categoría, origen y función. Buscador y filtros.',
  },
  other: {
    'application-name': 'Guía Aditivos E meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Aditivos E Alimentarios',
  description: 'Base de datos consultable de los 90 aditivos E alimentarios más comunes. Incluye código E, nombre científico, categoría, origen (natural/sintético/semisintético), función tecnológica en el alimento y ejemplos de productos donde aparecen.',
  url: 'https://meskeia.com/aditivos-e-alimentarios/',
  features: [
    'Búsqueda por código E o nombre del aditivo',
    'Filtro por categoría (colorante, conservante, antioxidante, emulsionante...)',
    '90 aditivos E con información oficial EFSA',
    'Origen de cada aditivo: natural, sintético o semisintético',
    'Ejemplos de alimentos donde aparece cada aditivo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
