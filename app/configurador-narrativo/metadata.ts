import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Configurador Narrativo — Elige Persona, Narrador y Tiempo Verbal | meskeIA',
  description: 'Herramienta interactiva para escritores: elige persona narrativa (1ª/3ª/2ª), tipo de narrador (omnisciente, limitado, testigo, no fiable) y tiempo verbal. Cada combinación analiza el efecto en el lector con ejemplos de grandes novelas.',
  keywords: 'narrador omnisciente, primera persona narrativa, tercera persona limitada, tiempo verbal narración, narrador no fiable, perspectiva narrativa, escritura creativa, técnica narrativa, como escribir una novela',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Configurador Narrativo — Elige Persona, Narrador y Tiempo Verbal',
    description: 'Elige tu combinación narrativa y descubre qué efecto produce en el lector, cuándo usarla y qué novelas la utilizan.',
    url: 'https://meskeia.com/configurador-narrativo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Configurador Narrativo — Persona, Narrador y Tiempo Verbal',
    description: 'Herramienta para escritores: analiza el efecto de cada combinación narrativa con ejemplos de grandes novelas.',
  },
  other: {
    'application-name': 'Configurador Narrativo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Configurador Narrativo — Persona, Narrador y Tiempo Verbal',
  description: 'Herramienta interactiva para escritores que analiza las combinaciones de persona narrativa, tipo de narrador y tiempo verbal. Incluye efecto en el lector, cuándo usar cada combinación, ejemplos de grandes novelas y tabla de referencia de autores clásicos.',
  url: 'https://meskeia.com/configurador-narrativo/',
  category: 'EducationalApplication',
  features: [
    '14 combinaciones narrativas válidas analizadas en profundidad',
    'Tres dimensiones: persona (1ª/3ª/2ª), narrador y tiempo verbal',
    'Efecto en el lector, fortalezas y debilidades de cada combinación',
    'Cuándo usar y cuándo evitar cada configuración',
    'Ejemplos de grandes novelas que usan cada combinación',
    'Tabla de referencia de 10 grandes autores y su elección técnica',
    'Combinaciones inválidas explicadas con el motivo',
    'Gratuito, sin registro, en español',
  ],
});
