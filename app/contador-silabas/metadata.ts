import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Contador de Sílabas Online - Cuenta y Separa Sílabas en Español',
  description: 'Cuenta sílabas y sepáralas con guiones al instante. Para poesía (versos, métrica), ortografía y deberes escolares. Reconoce diptongos, hiatos y triptongos. Gratis.',
  keywords: 'contador sílabas, separar sílabas, silabeador español, división silábica, sílabas online, poesía, métrica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/contador-silabas/',
  },
  openGraph: {
    type: 'website',
    title: 'Contador de Sílabas Online - Cuenta y Separa Sílabas',
    description: 'Cuenta sílabas y sepáralas con guiones al instante. Para poesía, ortografía y deberes escolares. Diptongos, hiatos y triptongos.',
    url: 'https://meskeia.com/contador-silabas/',
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
    title: 'Contador de Sílabas Online',
    description: 'Cuenta sílabas y sepáralas con guiones. Para poesía, ortografía y escolares.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Contador de Sílabas',
  description: 'Contador y separador de sílabas en español. Divide palabras y textos en sílabas siguiendo las reglas del español. Útil para métrica poética, ortografía y enseñanza del idioma.',
  url: 'https://meskeia.com/contador-silabas/',
  category: 'EducationalApplication',
  features: [
    'Separación silábica de palabras y textos',
    'Conteo automático de sílabas',
    'Análisis métrico para poesía',
    'Identificación de diptongos, hiatos y triptongos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['contador sílabas', 'separar sílabas', 'silabeador', 'métrica poesía', 'ortografía'],
});
