import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Meta Descripciones SEO - Vista Previa Google | meskeIA',
  description: 'Genera meta descripciones optimizadas para SEO. Contador de caracteres en tiempo real, vista previa de snippet de Google y plantillas por tipo de página.',
  keywords: 'meta description, seo, google, serp, ctr, snippet, descripcion, generador, optimizar, caracteres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Meta Descripciones SEO - meskeIA',
    description: 'Crea meta descripciones perfectas para mejorar tu CTR en Google',
    url: 'https://meskeia.com/generador-meta-descripciones/',
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
    title: 'Generador de Meta Descripciones SEO - meskeIA',
    description: 'Genera meta descripciones optimizadas con vista previa de Google',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador Meta Descripciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Meta Descripciones",
  description: "Genera meta descripciones optimizadas para SEO. Contador de caracteres en tiempo real, vista previa de snippet de Google y plantillas por tipo de página.",
  url: "https://meskeia.com/generador-meta-descripciones/",
  category: 'UtilityApplication',
  features: [],
});
