import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Recursos Literarios — Guía Visual de Figuras Retóricas | meskeIA',
  description: 'Explora 27 figuras retóricas con definición, ejemplos reales y cómo distinguirlas. Filtra por nivel (ESO, Bachillerato, Selectividad) y categoría. Ideal para estudiar literatura.',
  keywords: 'figuras retóricas, recursos literarios, metáfora, símil, hipérbole, anáfora, ironía, metonimia, oxímoron, paradoja, figuras retóricas bachillerato, selectividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
    description: 'Explora 27 figuras retóricas con definición, ejemplos reales y cómo distinguirlas. Filtra por nivel y categoría.',
    url: 'https://meskeia.com/visualizador-recursos-literarios',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
    description: 'Explora 27 figuras retóricas con definición, ejemplos y cómo distinguirlas. Filtra por nivel y categoría.',
  },
  other: {
    'application-name': 'Recursos Literarios meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Recursos Literarios — Guía Visual de Figuras Retóricas',
  description: 'Directorio visual de 27 figuras retóricas con definición, ejemplos reales, campo "cómo no confundirla" y filtros por nivel (ESO, Bachillerato, Selectividad) y grupo. Incluye sección de pares frecuentemente confundidos.',
  url: 'https://meskeia.com/visualizador-recursos-literarios/',
  category: 'EducationalApplication',
  features: [
    '27 figuras retóricas en 3 niveles: ESO, Bachillerato y Selectividad',
    'Filtros por nivel y por grupo (imagen, repetición, contraste, énfasis, sintaxis, contigüidad)',
    'Buscador por nombre de figura',
    'Campo "cómo no confundirla" para cada figura',
    'Sección de 6 pares frecuentemente confundidos',
    'Múltiples ejemplos reales por figura',
    'Enlace directo al quiz para practicar el reconocimiento',
    'Gratuito, sin registro, en español',
  ],
});
