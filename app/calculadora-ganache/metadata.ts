import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ganache — Proporciones de Chocolate y Nata según Textura | meskeIA',
  description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada: glaseado, trufa o firme. Ratios profesionales al instante.',
  keywords: 'calculadora ganache, proporciones ganache, chocolate nata ratio, ganache trufa, ganache glaseado, ganache firme, repostería, chocolate negro blanco con leche',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-ganache/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ganache - Proporciones de Chocolate y Nata',
    description: 'Calcula las proporciones exactas de chocolate y nata para ganache según el tipo de chocolate y la textura deseada.',
    url: 'https://meskeia.com/calculadora-ganache/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Ganache | meskeIA',
    description: 'Ratios profesionales de ganache: chocolate negro, con leche o blanco para glaseado, trufa o bombones.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Ganache meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Ganache',
  description: 'Calculadora de proporciones de ganache para repostería: selecciona el tipo de chocolate (negro extra, negro, semi-fondant, con leche o blanco) y la textura deseada (glaseado, trufa o firme) para obtener las cantidades exactas de chocolate y nata.',
  url: 'https://meskeia.com/calculadora-ganache/',
  category: 'UtilityApplication',
  features: [
    'Ratios de ganache para 5 tipos de chocolate',
    'Tres texturas: glaseado, trufa y firme',
    'Cantidades exactas de chocolate y nata en gramos',
    'Temperatura de trabajo recomendada para cada textura',
    'Usos típicos de cada combinación de ganache',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['ganache', 'proporciones chocolate', 'nata ganache', 'repostería', 'trufas chocolate'],
});
