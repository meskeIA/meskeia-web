import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Círculo de Quintas Interactivo — Acordes, Tonalidades y Armonía | meskeIA',
  description: 'Explora el círculo de quintas: haz clic en cualquier tonalidad y descubre sus acordes diatónicos, armadura de clave, relativa menor y tonalidades vecinas. Teoría musical visual.',
  keywords: [
    'círculo de quintas',
    'teoría musical',
    'acordes diatónicos',
    'armadura de clave',
    'tonalidades',
    'armonía musical',
    'relativa menor',
    'progresiones de acordes',
    'música',
    'composición musical',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Círculo de Quintas Interactivo — Acordes y Armonía',
    description: 'Haz clic en cualquier tonalidad y descubre sus acordes diatónicos, armadura de clave y relativa menor. Herramienta visual de teoría musical.',
    url: 'https://meskeia.com/visualizador-circulo-quintas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA — Círculo de Quintas Interactivo',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Círculo de Quintas Interactivo | meskeIA',
    description: 'Haz clic en cualquier tonalidad y descubre acordes diatónicos, armadura y relativa menor. Teoría musical visual.',
  },
  alternates: {
    canonical: 'https://meskeia.com/visualizador-circulo-quintas/',
  },
  other: {
    'application-name': 'Círculo de Quintas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Círculo de Quintas Interactivo',
  description: 'Visualizador interactivo del círculo de quintas. Haz clic en cualquier tonalidad para ver sus acordes diatónicos, armadura de clave, relativa menor y progresiones populares. Herramienta esencial de teoría musical.',
  url: 'https://meskeia.com/visualizador-circulo-quintas/',
  category: 'EducationalApplication',
  features: [
    'Círculo de quintas SVG interactivo con 12 tonalidades mayores y sus relativas menores',
    'Muestra los 7 acordes diatónicos al seleccionar cualquier tonalidad',
    'Armadura de clave con sostenidos y bemoles para cada tonalidad',
    'Identificación de tonalidades vecinas: dominante y subdominante',
    'Progresiones populares (I-IV-V, I-V-vi-IV, ii-V-I) para cada tonalidad',
    'Resaltado visual de enharmonías (F#/Gb, B/Cb, C#/Db)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Diseño responsivo optimizado para móvil y escritorio',
  ],
});
