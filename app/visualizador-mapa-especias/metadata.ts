import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de las Especias - Rutas, Origen e Historia | meskeIA',
  description: 'Explora las rutas comerciales de las especias, su valor histórico, el origen de 12 especias populares y su presencia en las cocinas del mundo. Explicador visual interactivo.',
  keywords: 'especias, rutas comerciales, ruta de la seda, pimienta, canela, azafrán, comercio especias, historia especias, origen especias, cocina mundial, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de las Especias - Rutas, Origen e Historia',
    description: 'Las rutas que cambiaron el mundo: pimienta como moneda, nuez moscada más cara que el oro, guerras por el clavo. Historia visual de las especias.',
    url: 'https://meskeia.com/visualizador-mapa-especias',
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
    title: 'El Mapa de las Especias - Rutas, Origen e Historia',
    description: 'Rutas comerciales, precios históricos y orígenes de las especias que cambiaron la historia. Explicador visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Especias meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de las Especias',
  description: 'Explicador visual interactivo sobre las especias: rutas comerciales históricas (Ruta de la Seda, Ruta Marítima de las Especias), valor histórico comparado con el oro, origen de 12 especias populares y su presencia en las cocinas del mundo.',
  url: 'https://meskeia.com/visualizador-mapa-especias/',
  category: 'EducationalApplication',
  features: [
    'Rutas comerciales históricas: Seda, Marítima, Árabe, Venecia',
    'Comparativas de valor histórico: especias vs. oro',
    'Origen y producción de 12 especias populares',
    'Especias por cocina: mediterránea, india, mexicana, asiática',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
