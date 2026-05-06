import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Metamorfosis - La Transformación más Radical de la Naturaleza | meskeIA',
  description: 'Descubre la metamorfosis animal paso a paso: completa (mariposa), incompleta (saltamontes) y anfibio (rana). Explicador visual interactivo con animaciones.',
  keywords: 'metamorfosis, mariposa, rana, saltamontes, holometábola, hemimetábola, larva, pupa, crisálida, renacuajo, biología, ciclo vida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Metamorfosis - La Transformación más Radical de la Naturaleza',
    description: 'De oruga a mariposa, de renacuajo a rana: la metamorfosis animal como nunca la habías visto.',
    url: 'https://meskeia.com/visualizador-metamorfosis',
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
    title: 'Metamorfosis Animal - Explicador Visual',
    description: 'Tres tipos de metamorfosis animal explicados con animaciones paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Metamorfosis Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Metamorfosis - La Transformación más Radical de la Naturaleza',
  description: 'Explicador visual interactivo sobre la metamorfosis animal: completa (mariposa), incompleta (saltamontes) y anfibio (rana). Animaciones de transformación, datos por fase y curiosidades.',
  url: 'https://meskeia.com/visualizador-metamorfosis/',
  category: 'EducationalApplication',
  features: [
    'Metamorfosis completa: mariposa monarca paso a paso',
    'Metamorfosis incompleta: saltamontes y libélula',
    'Metamorfosis anfibio: de renacuajo a rana',
    'Datos fascinantes sobre transformación animal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
