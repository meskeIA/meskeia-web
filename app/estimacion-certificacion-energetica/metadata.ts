import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Certificacion Energetica - Letra Eficiencia Vivienda | meskeIA',
  description:
    'Estima la letra energetica de tu vivienda (A-G) segun antiguedad, aislamiento, ventanas, calefaccion y zona climatica. Orientativo, no sustituye al certificado oficial.',
  keywords:
    'certificado energetico, letra energetica vivienda, etiqueta energetica casa, certificacion energetica Espana, cuanto consume mi casa, eficiencia energetica hogar, clase energetica piso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Certificacion Energetica | meskeIA',
    description:
      'Calcula una estimacion orientativa de la letra energetica de tu vivienda segun sus caracteristicas. Gratuito y sin registro.',
    url: 'https://meskeia.com/estimacion-certificacion-energetica',
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
    title: 'Estimacion de Certificacion Energetica | meskeIA',
    description:
      'Descubre la letra energetica aproximada de tu vivienda (A-G) segun antiguedad, aislamiento y sistemas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimacion Certificacion Energetica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Certificacion Energetica',
  description:
    'Herramienta orientativa para estimar la letra de eficiencia energetica (A-G) de una vivienda en Espana segun su antiguedad, zona climatica, aislamiento, ventanas, sistema de calefaccion, agua caliente, energias renovables y orientacion.',
  url: 'https://meskeia.com/estimacion-certificacion-energetica/',
  features: [
    'Estimacion de letra energetica A-G segun 8 factores',
    'Consumo estimado en kWh/m2/ano y emisiones CO2',
    'Sugerencias de mejora personalizadas',
    'Barra comparativa visual de todas las letras',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
