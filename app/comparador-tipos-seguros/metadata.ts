import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Tipos de Seguros - Guía Completa | meskeIA',
  description: 'Compara tipos de seguros en España: vida, auto, hogar y salud. Descubre las diferencias entre coberturas y elige el seguro adecuado para ti.',
  keywords: 'tipos de seguros, comparador seguros, seguro vida, seguro coche, seguro hogar, seguro salud, todo riesgo, terceros, vida temporal, España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Tipos de Seguros - Guía Completa | meskeIA',
    description: 'Guía educativa sobre tipos de seguros en España: vida, auto, hogar y salud. Compara coberturas y características.',
    url: 'https://meskeia.com/comparador-tipos-seguros/',
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
    title: 'Comparador de Tipos de Seguros - meskeIA',
    description: 'Guía educativa sobre tipos de seguros en España: vida, auto, hogar y salud.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-tipos-seguros/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Tipos de Seguros",
  description: "Compara tipos de seguros en España: vida, auto, hogar y salud. Descubre las diferencias entre coberturas y elige el seguro adecuado para ti.",
  url: "https://meskeia.com/comparador-tipos-seguros/",
  category: 'FinanceApplication',
  features: [],
});
