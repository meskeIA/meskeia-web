import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Guía de Comentario de Texto Literario | meskeIA',
  description: 'Aprende a hacer un comentario de texto literario paso a paso: metodología completa, análisis de poesía y prosa, vocabulario técnico y plantillas listas para usar en selectividad y Bachillerato.',
  keywords: ['comentario de texto literario', 'como comentar un poema', 'análisis texto literario', 'comentario selectividad', 'bachillerato lengua comentario', 'analizar poesia', 'análisis literario paso a paso', 'tema estructura recursos literarios', 'EBAU comentario texto', 'analisis narrativo'],
  openGraph: {
    title: 'Guía de Comentario de Texto Literario | meskeIA',
    description: 'Metodología completa, ejemplo trabajado, vocabulario técnico y plantillas para el comentario de texto literario.',
    url: 'https://meskeia.com/guia-comentario-texto/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Comentario de Texto Literario',
  description: 'Guía completa para hacer comentarios de texto literario: metodología en 7 pasos, análisis de poesía y prosa con ejemplos reales, glosario de términos técnicos y plantillas de frases listas para selectividad y Bachillerato.',
  url: 'https://meskeia.com/guia-comentario-texto/',
  category: 'EducationalApplication',
  features: [
    'Metodología universal en 7 pasos para cualquier texto literario',
    'Guía específica para comentar poesía con ejemplo trabajado (Bécquer)',
    'Guía específica para comentar textos en prosa narrativa',
    'Vocabulario técnico organizado por categoría (métrica, figuras, narratología)',
    'Plantillas de frases listas para cada sección del comentario',
    'Errores frecuentes en exámenes de selectividad EBAU/PAES',
    'Adaptado al currículo de Bachillerato y acceso universitario en España y Latinoamérica',
  ],
});
