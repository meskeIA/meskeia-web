import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Tipos de Pan del Mundo | meskeIA',
  description: 'Guía de referencia de 35 tipos de pan: sourdough, baguette, naan, ciabatta, injera y más. Fermentación, harina, historia y maridaje.',
  keywords: 'tipos de pan, pan del mundo, sourdough, baguette, masa madre, pan artesanal, fermentación, tipos de harina, pan internacional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Tipos de Pan del Mundo | meskeIA',
    description: '35 tipos de pan del mundo: fermentación, harina, acompañamientos y curiosidades. Filtros por región y técnica.',
    url: 'https://meskeia.com/guia-tipos-pan',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Tipos de Pan del Mundo | meskeIA',
    description: '35 tipos de pan del mundo: sourdough, baguette, naan, injera y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Tipos de Pan meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Tipos de Pan del Mundo',
  description: 'Directorio de 35 tipos de pan del mundo con fichas de panadería: región, harina, fermentación, tiempo de fermentación, acompañamientos, usos y curiosidades. Filtros por región, harina, fermentación y textura.',
  url: 'https://meskeia.com/guia-tipos-pan/',
  features: [
    '35 tipos de pan con ficha completa',
    'Filtros por región, harina, fermentación y textura de miga',
    'Búsqueda por nombre, país o región',
    'Acompañamientos y usos recomendados',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
  category: 'EducationalApplication',
});
