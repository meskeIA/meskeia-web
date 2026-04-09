import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cartografía y Proyecciones - Mercator, Peters y Robinson | meskeIA',
  description: 'Por qué Groenlandia parece del tamaño de África. 5 proyecciones cartográficas comparadas, coordenadas y husos horarios.',
  keywords: 'cartografia, proyecciones, Mercator, Peters, Robinson, mapa, coordenadas, husos horarios, distorsion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cartografía y Proyecciones',
    description: '5 proyecciones cartográficas explicadas visualmente',
    url: 'https://meskeia.com/visualizador-cartografia-proyecciones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cartografía y Proyecciones',
    description: 'Por qué todos los mapas mienten — y cómo',
  },
  other: {
    'application-name': 'Cartografía meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cartografía y Proyecciones',
  description: 'Explora 5 proyecciones cartográficas (Mercator, Peters, Robinson, Mollweide, Azimutal), compara distorsiones, entiende coordenadas y husos horarios.',
  url: 'https://meskeia.com/visualizador-cartografia-proyecciones/',
  category: 'EducationalApplication',
  features: [
    '5 proyecciones cartográficas comparadas',
    'Groenlandia vs África en cada proyección',
    'Indicadores de Tissot',
    'Coordenadas y husos horarios',
    'Funciona 100% en el navegador',
    'Gratuito y en español',
  ],
});
