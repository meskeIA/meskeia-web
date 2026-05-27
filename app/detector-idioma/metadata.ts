import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Detector de Idioma Online - Identifica el Idioma de un Texto | meskeIA',
  description: 'Detector de idioma gratuito. Pega cualquier texto y descubre en qué idioma está escrito. Detecta más de 20 idiomas con porcentaje de confianza.',
  keywords: 'detector idioma, identificar idioma, que idioma es, detectar lengua, language detector, idioma texto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Detector de Idioma Online - meskeIA',
    description: 'Identifica el idioma de cualquier texto. Detecta más de 20 idiomas.',
    url: 'https://meskeia.com/detector-idioma/',
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
    title: 'Detector de Idioma Online',
    description: 'Identifica el idioma de cualquier texto automáticamente.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Detector de Idioma",
  description: "Detector de idioma gratuito. Pega cualquier texto y descubre en qué idioma está escrito. Detecta más de 20 idiomas con porcentaje de confianza.",
  url: "https://meskeia.com/detector-idioma/",
  category: 'EducationalApplication',
  features: [],
});
