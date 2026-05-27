import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Velocidad de Escritura - Mide tus PPM y Precisión | meskeIA',
  description: 'Test de mecanografía online gratuito. Mide tu velocidad de escritura en palabras por minuto (PPM), precisión y mejora tu técnica con textos en español.',
  keywords: 'test velocidad escritura, palabras por minuto, ppm, mecanografia, typing test, velocidad teclear, test mecanografia español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Velocidad de Escritura - meskeIA',
    description: 'Mide tu velocidad de escritura en palabras por minuto y mejora tu mecanografía.',
    url: 'https://meskeia.com/test-velocidad-escritura/',
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
    title: 'Test de Velocidad de Escritura',
    description: 'Mide tu velocidad de escritura en palabras por minuto y mejora tu mecanografía.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Velocidad de Escritura",
  description: "Test de mecanografía online gratuito. Mide tu velocidad de escritura en palabras por minuto (PPM), precisión y mejora tu técnica con textos en español.",
  url: "https://meskeia.com/test-velocidad-escritura/",
  category: 'UtilityApplication',
  features: [],
});
