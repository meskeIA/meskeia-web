import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transpositor de Acordes — Cambia el Tono de tu Canción | meskeIA',
  description: 'Transpón los acordes de cualquier canción a otro tono al instante. Introduce tus acordes, elige el tono destino y obtén la versión transpuesta. Gratuito, sin registro.',
  keywords: 'transpositor acordes, cambiar tono canción, transponer guitarra, acordes transpuestos, cambio tonalidad, transposición musical, acordes guitarra, escala cromática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transpositor de Acordes | meskeIA',
    description: 'Transpón los acordes de cualquier canción a otro tono al instante. Ideal para guitarristas y cantantes.',
    url: 'https://meskeia.com/transpositor-acordes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transpositor de Acordes | meskeIA',
    description: 'Transpón acordes a cualquier tonalidad al instante. Gratuito y sin registro.',
  },
  other: {
    'application-name': 'Transpositor de Acordes meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Transpositor de Acordes',
  description: 'Herramienta para transponer acordes de guitarra y piano a cualquier tonalidad. Introduce los acordes de una canción, selecciona el tono original y destino, y obtén los acordes transpuestos al instante.',
  url: 'https://meskeia.com/transpositor-acordes/',
  category: 'UtilityApplication',
  features: [
    'Transposición instantánea de acordes a cualquier tonalidad',
    'Soporta acordes con sufijos: m, 7, m7, maj7, sus2, sus4, dim, aug y más',
    'Tabla de referencia con los 7 grados en ambas tonalidades',
    'Progresiones predefinidas populares (I-V-vi-IV, ii-V-I, etc.)',
    'Copia el resultado con un clic',
    'Selector de tono original y destino con las 12 notas de la escala cromática',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
