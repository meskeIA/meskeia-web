import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glosario de Física y Química - Definiciones y Conceptos | meskeIA',
  description: 'Glosario completo de términos de física y química. Más de 100 definiciones con niveles básico, intermedio y avanzado. Búsqueda por categorías y modo quiz para aprender.',
  keywords: 'glosario física, glosario química, definiciones física, conceptos química, términos científicos, diccionario ciencias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Glosario de Física y Química | meskeIA',
    description: 'Consulta definiciones de física y química organizadas por categoría y nivel de dificultad.',
    url: 'https://meskeia.com/glosario-fisica-quimica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glosario de Física y Química | meskeIA',
    description: 'Consulta definiciones de física y química organizadas por categoría y nivel.',
  },
};
