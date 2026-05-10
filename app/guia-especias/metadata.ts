import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Especias - Perfil, usos y conservación | meskeIA',
  description: 'Directorio de 65 especias: perfil de sabor, intensidad, usos culinarios, origen, con qué combinan y cómo conservarlas. Buscador y filtros por familia de sabor.',
  keywords: 'especias cocina, guía especias, pimienta, canela, cúrcuma, comino, azafrán, conservar especias, mezclas especias, cocina con especias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Especias | meskeIA',
    description: 'Consulta el perfil de 65 especias: sabor, intensidad, usos, origen y con qué combinan. Referencia culinaria práctica.',
    url: 'https://meskeia.com/guia-especias/',
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
    title: 'Guía de Especias | meskeIA',
    description: 'Directorio de 65 especias: perfil de sabor, usos culinarios y consejos de conservación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Especias meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Especias',
  description: 'Directorio consultable de 65 especias con perfil de sabor, intensidad, usos culinarios principales, región de origen, especias con las que combinan mejor y guía de conservación. Filtros por familia de sabor y buscador por nombre o uso.',
  url: 'https://meskeia.com/guia-especias/',
  features: [
    'Búsqueda por nombre de especia o uso culinario',
    'Filtros por familia de sabor (picante, dulce, herbal, floral...)',
    '65 especias con perfil completo',
    'Indicador visual de intensidad por especia',
    'Con qué especias combina cada una',
    'Guía de conservación (tiempo y método)',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});
