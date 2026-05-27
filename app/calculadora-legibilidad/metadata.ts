import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Legibilidad - Índices Flesch para Español | meskeIA',
  description: 'Analiza la legibilidad de tus textos en español con índices Flesch-Szigriszt, Fernández Huerta e INFLESZ. Descubre el nivel educativo de tu contenido.',
  keywords: 'legibilidad, flesch, szigriszt, fernandez huerta, inflesz, readability, texto, español, nivel lectura, seo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Legibilidad - Índices Flesch para Español',
    description: 'Analiza la legibilidad de tus textos con fórmulas adaptadas al español',
    url: 'https://meskeia.com/calculadora-legibilidad/',
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
    title: 'Calculadora de Legibilidad',
    description: 'Mide la facilidad de lectura de tus textos en español',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Legibilidad",
  description: "Analiza la legibilidad de tus textos en español con índices Flesch-Szigriszt, Fernández Huerta e INFLESZ. Descubre el nivel educativo de tu contenido.",
  url: "https://meskeia.com/calculadora-legibilidad/",
  category: 'UtilityApplication',
  features: [],
});
