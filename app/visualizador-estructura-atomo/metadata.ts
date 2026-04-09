import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructura del Átomo - Protones, Neutrones, Electrones | meskeIA',
  description: 'Explora el átomo de forma visual: modelo de Bohr, orbitales, isótopos e iones. Descubre que el átomo es 99,9999% vacío. Explicador interactivo con SVG animado.',
  keywords: 'átomo, protones, neutrones, electrones, modelo de Bohr, orbitales, isótopos, iones, estructura atómica, quarks, modelo estándar, configuración electrónica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructura del Átomo - Protones, Neutrones, Electrones',
    description: 'Visualiza protones, neutrones y electrones. Modelo de Bohr vs orbitales. Isótopos, iones y la escala atómica.',
    url: 'https://meskeia.com/visualizador-estructura-atomo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estructura del Átomo - Explicador Visual Interactivo',
    description: 'El átomo es 99,9999% vacío. Explora sus partículas, modelos y escalas de forma visual.',
  },
  other: { 'application-name': 'Estructura Átomo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructura del Átomo - Protones, Neutrones, Electrones',
  description: 'Explicador visual interactivo sobre la estructura atómica: las 3 partículas subatómicas, modelo de Bohr vs orbitales cuánticos, isótopos e iones, y la asombrosa escala del vacío atómico.',
  url: 'https://meskeia.com/visualizador-estructura-atomo/',
  category: 'EducationalApplication',
  features: [
    'SVG animado del átomo con protones, neutrones y electrones para 5 elementos',
    'Comparación visual modelo de Bohr vs orbitales cuánticos (s, p, d)',
    'Explorador de isótopos e iones con ejemplos reales (C-14, deuterio, NaCl)',
    'Escala atómica: analogías visuales del vacío y línea temporal de descubrimientos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
