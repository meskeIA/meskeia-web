import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas | meskeIA',
  description: 'Explicador visual interactivo de meteorologia: tipos de nubes por altitud, como se forma la lluvia, nieve y granizo, rayos, huracanes, tornados y DANA. Datos fascinantes.',
  keywords: 'tipos de nubes, meteorologia, precipitaciones, lluvia, nieve, granizo, rayos, huracanes, tornados, DANA, gota fria, fenomenos meteorologicos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
    description: 'Descubre que cuentan las nubes, como se forma la lluvia o la nieve, por que caen rayos y como nacen los huracanes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-fenomenos-meteorologicos/',
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
    title: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
    description: 'Un rayo alcanza 30.000 grados C — 5 veces la superficie del Sol. Explicador visual interactivo de meteorologia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fenomenos Meteorologicos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fenomenos Meteorologicos - Nubes, Precipitaciones, Rayos y Tormentas',
  description: 'Explicador visual interactivo de meteorologia: 10 tipos de nubes clasificados por altitud, formacion de lluvia, nieve y granizo, rayos, huracanes, tornados y DANA. Datos y curiosidades atmosfericas.',
  url: 'https://meskeia.com/visualizador-fenomenos-meteorologicos/',
  features: [
    'Clasificacion de 10 tipos de nubes por altitud con diagrama SVG',
    'Formacion de lluvia, nieve, granizo y niebla explicada paso a paso',
    'Rayos, huracanes, tornados y DANA con datos reales',
    'Datos y curiosidades meteorologicas fascinantes',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
