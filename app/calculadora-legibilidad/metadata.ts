import { Metadata } from 'next';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Legibilidad',
    description: 'Mide la facilidad de lectura de tus textos en español',
  },
};
