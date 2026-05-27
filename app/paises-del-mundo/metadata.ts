import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Países del Mundo - Buscador con Capitales, Banderas y Datos | meskeIA',
  description: 'Explora los 195 países del mundo. Busca por nombre o capital y descubre banderas, población, superficie, moneda, idioma y prefijo telefónico de cada país.',
  keywords: 'países del mundo, capitales, banderas, monedas, idiomas, población, superficie, prefijo telefónico, atlas mundial, geografía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Países del Mundo - Buscador Completo | meskeIA',
    description: 'Explora los 195 países del mundo con sus capitales, banderas, monedas, idiomas y más datos interesantes.',
    url: 'https://meskeia.com/paises-del-mundo/',
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
    title: 'Países del Mundo - Buscador Completo | meskeIA',
    description: 'Explora los 195 países del mundo con sus capitales, banderas, monedas, idiomas y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Países del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Países del Mundo",
  description: "Explora los 195 países del mundo. Busca por nombre o capital y descubre banderas, población, superficie, moneda, idioma y prefijo telefónico de cada país.",
  url: "https://meskeia.com/paises-del-mundo/",
  category: 'EducationalApplication',
  features: [],
});
