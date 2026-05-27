import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor Base64 - Codifica y Decodifica Texto e Imágenes | meskeIA',
  description: 'Codifica y decodifica texto, imágenes y archivos en Base64. Genera data URI para desarrollo web, convierte imágenes a Base64 para CSS inline.',
  keywords: 'base64, codificar, decodificar, encode, decode, data uri, imagen base64, texto base64, conversor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor Base64',
    description: 'Codifica y decodifica texto, imágenes y archivos en Base64.',
    url: 'https://meskeia.com/conversor-base64/',
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
    title: 'Conversor Base64',
    description: 'Codifica y decodifica en Base64 online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor Base64",
  description: "Codifica y decodifica texto, imágenes y archivos en Base64. Genera data URI para desarrollo web, convierte imágenes a Base64 para CSS inline.",
  url: "https://meskeia.com/conversor-base64/",
  category: 'UtilityApplication',
  features: [],
});
