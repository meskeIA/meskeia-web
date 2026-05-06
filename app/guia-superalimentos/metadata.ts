import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Superalimentos - Propiedades, usos y curiosidades | meskeIA',
  description: '40 superalimentos del mundo: nutrientes destacados, beneficios tradicionales, cómo consumirlos, cantidad orientativa y contraindicaciones. Frutas, algas, fermentados, hongos medicinales y más.',
  keywords: 'superalimentos, alimentos saludables, nutrientes, arándanos, spirulina, cúrcuma, quinoa, kéfir, moringa, reishi, fermentados, algas, semillas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Superalimentos | meskeIA',
    description: '40 superalimentos del mundo: propiedades, beneficios tradicionales, cómo consumirlos y curiosidades históricas.',
    url: 'https://meskeia.com/guia-superalimentos/',
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
    title: 'Guía de Superalimentos | meskeIA',
    description: '40 superalimentos: nutrientes, beneficios, cantidades orientativas y contraindicaciones. Con filtros por categoría.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Superalimentos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Superalimentos',
  description: 'Guía educativa de 40 superalimentos del mundo: nutrientes destacados, beneficios tradicionales documentados, cómo consumirlos, cantidad orientativa, contraindicaciones y combinaciones. Incluye frutas y bayas, verduras y hojas, semillas y frutos secos, algas y mar, cereales ancestrales, fermentados, hongos medicinales y especias y raíces.',
  url: 'https://meskeia.com/guia-superalimentos/',
  features: [
    '40 superalimentos organizados en 8 categorías',
    'Buscador por nombre o descripción',
    'Filtros por categoría de superalimento',
    'Nutrientes destacados por alimento',
    'Cantidad orientativa de consumo diario',
    'Contraindicaciones e interacciones conocidas',
    'Combinaciones sinérgicas con otros alimentos',
    'Curiosidades históricas y científicas',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
