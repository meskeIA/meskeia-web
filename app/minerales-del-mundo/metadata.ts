import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Minerales del Mundo - Guía de 50 Minerales Esenciales | meskeIA',
  description: 'Explora 50 minerales esenciales con su composición química, dureza Mohs, sistema cristalino, usos industriales y curiosidades. Guía completa para estudiantes y curiosos.',
  keywords: 'minerales, mineralogía, geología, escala mohs, cristales, cuarzo, diamante, oro, pirita, calcita, feldespato, mica, silicatos, óxidos, sulfuros, carbonatos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Minerales del Mundo - Guía de 50 Minerales Esenciales',
    description: 'Explora 50 minerales esenciales con su composición, dureza, usos y curiosidades. Ideal para estudiantes de geología y curiosos.',
    url: 'https://meskeia.com/minerales-del-mundo/',
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
    title: 'Minerales del Mundo - Guía Completa',
    description: 'Explora 50 minerales esenciales con su composición, dureza, usos y curiosidades.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Minerales del Mundo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Minerales del Mundo",
  description: "Explora 50 minerales esenciales con su composición química, dureza Mohs, sistema cristalino, usos industriales y curiosidades. Guía completa para estudiantes y curiosos.",
  url: "https://meskeia.com/minerales-del-mundo/",
  category: 'EducationalApplication',
  features: [],
});
