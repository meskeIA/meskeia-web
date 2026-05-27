import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Palabras Clave SEO - Ideas Long Tail | meskeIA',
  description: 'Genera ideas de palabras clave long-tail a partir de una semilla. Variaciones, preguntas, comparativas y sugerencias organizadas por categoría.',
  keywords: 'palabras clave, keywords, seo, long tail, generador, ideas, contenido, semrush, ahrefs, google',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Palabras Clave SEO - meskeIA',
    description: 'Genera cientos de ideas de keywords long-tail para tu estrategia SEO',
    url: 'https://meskeia.com/generador-palabras-clave/',
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
    title: 'Generador de Palabras Clave SEO - meskeIA',
    description: 'Herramienta gratuita para generar ideas de keywords y long-tails',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador Palabras Clave meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Palabras Clave",
  description: "Genera ideas de palabras clave long-tail a partir de una semilla. Variaciones, preguntas, comparativas y sugerencias organizadas por categoría.",
  url: "https://meskeia.com/generador-palabras-clave/",
  category: 'UtilityApplication',
  features: [],
});
