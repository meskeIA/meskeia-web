import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Analizador de Densidad de Palabras Clave SEO | meskeIA',
  description: 'Analiza la densidad de keywords en tu texto. Detecta sobreoptimización, calcula frecuencia de palabras y optimiza tu contenido para SEO on-page.',
  keywords: 'densidad palabras clave, keyword density, seo, on-page, analizador, frecuencia, optimizacion, contenido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Densidad SEO - meskeIA',
    description: 'Analiza y optimiza la densidad de palabras clave en tu contenido',
    url: 'https://meskeia.com/analizador-densidad-seo/',
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
    title: 'Analizador de Densidad SEO - meskeIA',
    description: 'Herramienta gratuita para analizar keywords y optimizar SEO on-page',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Analizador Densidad SEO meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador de Densidad SEO",
  description: "Analiza la densidad de keywords en tu texto. Detecta sobreoptimización, calcula frecuencia de palabras y optimiza tu contenido para SEO on-page.",
  url: "https://meskeia.com/analizador-densidad-seo/",
  category: 'UtilityApplication',
  features: [],
});
