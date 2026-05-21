import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Escalas Musicales — Notas, Intervalos y Piano | meskeIA',
  description: 'Explora las notas de cualquier escala musical: mayor, menor, pentatónica, blues y modos griegos. Visualización en teclado de piano, grados e intervalos.',
  keywords: 'escalas musicales, escala mayor, escala menor, pentatónica, blues, modos griegos, intervalos musicales, teclado piano, teoría musical, solfeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Escalas Musicales — meskeIA',
    description: 'Selecciona nota raíz y tipo de escala para ver las notas, grados e intervalos sobre un teclado de piano interactivo.',
    url: 'https://meskeia.com/visualizador-escalas-musicales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Escalas Musicales — meskeIA',
    description: 'Explora escalas mayor, menor, pentatónica, blues y modos griegos con visualización en teclado de piano.',
  },
  other: {
    'application-name': 'Visualizador de Escalas Musicales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Escalas Musicales',
  description: 'Herramienta interactiva para explorar escalas musicales: mayor, menor, pentatónica, blues y todos los modos griegos. Muestra las notas, intervalos, grados y su posición en el teclado de piano.',
  url: 'https://meskeia.com/visualizador-escalas-musicales/',
  category: 'EducationalApplication',
  features: [
    'Visualización de 12 tipos de escalas: mayor, menores, pentatónicas, blues y modos griegos',
    'Teclado de piano SVG con las notas de la escala resaltadas visualmente',
    'Muestra los grados de la escala (I, II, III, IV, V, VI, VII) para cada nota',
    'Acordes tríada diatónicos construidos sobre cada escala',
    'Descripción del carácter sonoro de cada escala',
    'Selector de las 12 notas cromáticas como raíz',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y disponible en español',
  ],
});
