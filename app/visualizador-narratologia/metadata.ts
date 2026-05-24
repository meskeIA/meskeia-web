import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa | meskeIA',
  description: 'Guía visual de narratología: historia vs. relato vs. narración, tiempo narrativo (analepsis, prolepsis, duración), voz y focalización (Genette) y modelo actancial (Greimas). Con ejemplos de grandes obras literarias.',
  keywords: 'narratologia, genette narratologia, modelo actancial greimas, focalizacion narrativa, analepsis prolepsis, narrador homodiegetico, narrador heterodiegetico, tiempo narrativo, teoria narrativa, estructura relato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
    description: 'Guía visual de narratología con los conceptos de Genette y Greimas. Historia, relato, narración, tiempo, voz, focalización y modelo actancial.',
    url: 'https://meskeia.com/visualizador-narratologia',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
    description: 'Historia vs. relato, tiempo narrativo, voz, focalización y modelo actancial. Con ejemplos literarios.',
  },
  other: {
    'application-name': 'Narratología Visual meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Narratología Visual — Genette, Greimas y Teoría Narrativa',
  description: 'Guía visual de los conceptos fundamentales de narratología: la tricotomía de Genette (historia, relato, narración), tiempo narrativo, voz, focalización y el modelo actancial de Greimas, con ejemplos de grandes obras.',
  url: 'https://meskeia.com/visualizador-narratologia/',
  category: 'EducationalApplication',
  features: [
    'Historia vs. relato vs. narración (tricotomía de Genette)',
    'Tiempo narrativo: anacronías, duración y frecuencia',
    'Voz narrativa: homodiegético, heterodiegético, autodiegético',
    'Focalización: cero, interna y externa',
    'Modelo actancial de Greimas con los 6 actantes',
    'Ejemplos de grandes obras literarias para cada concepto',
    'Gratuito, sin registro, en español',
  ],
});
