import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Aves Comunes - 40 aves de España y Europa | meskeIA',
  description: 'Directorio de 40 aves comunes de España y Europa: gorrión, mirlo, lechuza, cigüeña y más. Hábitat, alimentación, canto, estado de conservación y cuándo verlas. Filtros por hábitat, presencia y orden.',
  keywords: 'guia aves españa, aves comunes europa, identificar aves, birdwatching españa, aves rapaces, aves migratorias, gorrion mirlo petirrojo, ornitologia, observacion aves',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Aves Comunes de España y Europa | meskeIA',
    description: '40 aves comunes con hábitat, alimentación, canto, tamaño, envergadura y estado de conservación. Filtros por hábitat, presencia y orden taxonómico.',
    url: 'https://meskeia.com/guia-aves-comunes',
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
    title: 'Guía de Aves Comunes | meskeIA',
    description: '40 aves de España y Europa: hábitat, alimentación, canto y cuándo verlas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Aves Comunes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Aves Comunes',
  description: 'Directorio interactivo de 40 aves comunes de España y Europa con información sobre hábitat, alimentación, canto, tamaño, envergadura, presencia estacional y estado de conservación IUCN. Incluye filtros por hábitat, presencia y orden taxonómico, buscador por nombre y guía de iniciación al birdwatching.',
  url: 'https://meskeia.com/guia-aves-comunes/',
  features: [
    '40 aves comunes de España y Europa con ficha completa',
    'Filtros por hábitat, presencia estacional y orden taxonómico',
    'Búsqueda por nombre común o nombre científico',
    'Estado de conservación IUCN por especie',
    'Descripción del canto y curiosidades de cada ave',
    'Guía de iniciación al birdwatching paso a paso',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
