import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el Dolor — Nocicepción y Tipos | meskeIA',
  description: 'Fisiología del dolor: las 4 fases (transducción, transmisión, modulación, percepción), tipos de dolor agudo, crónico y neuropático, y sensibilización central.',
  keywords: 'nocicepción, dolor crónico, dolor neuropático, sensibilización central, fibras A-delta, fibras C, teoría puerta, endorfinas, fisiología dolor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-como-funciona-el-dolor/',
  },
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el Dolor — Nocicepción y Tipos',
    description: 'De la lesión al cerebro: fisiología de la nocicepción, tipos de dolor y sensibilización central. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-como-funciona-el-dolor',
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
    title: 'Cómo Funciona el Dolor — Explicador Visual',
    description: 'De la lesión al cerebro: las 4 fases del dolor, tipos y sensibilización central explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cómo Funciona el Dolor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el Dolor — Nocicepción y Tipos',
  description: 'Explicador visual interactivo sobre la fisiología del dolor: transducción, transmisión, modulación y percepción. Tipos de dolor agudo, crónico y neuropático. Sensibilización central y teoría de la puerta.',
  url: 'https://meskeia.com/visualizador-como-funciona-el-dolor/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases de la nocicepción con selector interactivo',
    'Tipos de dolor: agudo, crónico y neuropático',
    'Explicación de la sensibilización central',
    'Teoría de la puerta de Melzack & Wall',
    'Fibras A-delta y fibras C explicadas visualmente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
