import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Codificador Base64 Online - Codificar y Decodificar | meskeIA',
  description: 'Codifica y decodifica texto en Base64 y URL encoding. Soporta archivos e imágenes. Herramienta segura que funciona en tu navegador sin enviar datos.',
  keywords: 'base64, codificar base64, decodificar base64, base64 online, url encode, url decode, btoa, atob, codificacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Codificador Base64 Online | meskeIA',
    description: 'Codifica y decodifica texto en Base64 de forma segura.',
    url: 'https://meskeia.com/codificador-base64/',
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
    title: 'Codificador Base64 | meskeIA',
    description: 'Codifica y decodifica texto en Base64 online',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Codificador Base64",
  description: "Codifica y decodifica texto en Base64 y URL encoding. Soporta archivos e imágenes. Herramienta segura que funciona en tu navegador sin enviar datos.",
  url: "https://meskeia.com/codificador-base64/",
  category: 'UtilityApplication',
  features: [],
});
