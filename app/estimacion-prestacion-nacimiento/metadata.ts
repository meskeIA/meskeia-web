import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Prestacion por Nacimiento - Seguridad Social Espana | meskeIA',
  description: 'Estima la prestacion por nacimiento de la Seguridad Social en Espana. 100% de la base reguladora, 16 semanas de permiso. Calcula tu prestacion diaria, mensual y total.',
  keywords: 'prestacion nacimiento, baja maternidad cuanto cobro, prestacion paternidad, seguridad social nacimiento, 16 semanas permiso, permiso nacimiento espana, baja paternidad 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Prestacion por Nacimiento | meskeIA',
    description: 'Calcula cuanto cobraras durante el permiso por nacimiento: 100% de tu base reguladora, 16 semanas. Seguridad Social Espana.',
    url: 'https://meskeia.com/estimacion-prestacion-nacimiento/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimacion de Prestacion por Nacimiento | meskeIA',
    description: 'Estima tu prestacion por nacimiento de la Seguridad Social: cuantia diaria, duracion y total.',
  },
  other: { 'application-name': 'Estimacion Prestacion Nacimiento meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Prestacion por Nacimiento',
  description: 'Herramienta orientativa para estimar la prestacion por nacimiento y cuidado del menor de la Seguridad Social espanola. Calcula la cuantia diaria y total segun tu base de cotizacion, con informacion sobre duracion, ampliaciones y requisitos.',
  url: 'https://meskeia.com/estimacion-prestacion-nacimiento/',
  features: [
    'Calculo de prestacion diaria y total por nacimiento',
    'Ampliaciones por parto multiple y hospitalizacion neonatal',
    'Requisitos de cotizacion minima por edad',
    'Comparativa contributiva vs no contributiva',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
  ],
});
