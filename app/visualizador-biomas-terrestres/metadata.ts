import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-biomas-terrestres';
const TITLE = 'Biomas Terrestres: Clima, Biodiversidad y Amenazas - meskeIA';
const DESCRIPTION =
  'Explora los 7 biomas terrestres principales: temperatura, precipitación, biodiversidad característica, suelo, fauna representativa y amenazas ambientales de cada ecosistema.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'biomas terrestres, ecosistemas, biodiversidad, bosque tropical, tundra, taiga, desierto, sabana, mediterráneo, bosque templado, cambio climático, conservación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
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
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Biomas meskeIA' },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Explorador interactivo de los 7 biomas terrestres principales',
      'Climograma de Walter-Lieth con temperatura y precipitación mensual',
      'Distribución latitudinal de biomas en mapa conceptual',
      'Tabla de conservación con superficie protegida por bioma',
      'Amenazas globales: deforestación, cambio climático, fragmentación',
      'Fauna y flora representativa de cada ecosistema',
      'Gratuito, en español, sin registro',
    ],
    category: 'EducationalApplication',
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Biomas Terrestres: Clima, Fauna y Conservación",
  description: "Visualizador interactivo de biomas terrestres. Selector de 7 biomas (tropical, templado, taiga, tundra, desierto, sabana, mediterráneo) con datos completos, climograma Walter-Lieth con barras de preci",
  url: "https://meskeia.com/visualizador-biomas-terrestres/",
  category: 'EducationalApplication',
  features: [],
});
