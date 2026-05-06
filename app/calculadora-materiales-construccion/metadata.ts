import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Materiales de Construcción - Azulejos, Pintura, Tarima | meskeIA',
  description: 'Calcula los materiales que necesitas para tus reformas: azulejos, pintura, tarima y mortero. Incluye porcentaje de desperdicio y estimación de coste. Gratis y sin registro.',
  keywords: 'calculadora materiales construccion, cuantos azulejos necesito, litros pintura paredes, cajas tarima, sacos mortero, reformas hogar, calculadora reformas, presupuesto materiales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Materiales de Construcción | meskeIA',
    description: 'Calcula azulejos, pintura, tarima y mortero para tus reformas. Con desperdicio y coste estimado.',
    url: 'https://meskeia.com/calculadora-materiales-construccion',
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
    title: 'Calculadora de Materiales de Construcción | meskeIA',
    description: 'Calcula azulejos, pintura, tarima y mortero para tus reformas en pocos segundos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Materiales Construcción meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Materiales de Construcción',
  description: 'Herramienta gratuita para calcular la cantidad de materiales necesarios en reformas del hogar: azulejos, baldosas, pintura, tarima y mortero. Incluye cálculo de desperdicio y estimación de coste total.',
  url: 'https://meskeia.com/calculadora-materiales-construccion/',
  features: [
    'Cálculo de azulejos y baldosas con porcentaje de desperdicio configurable',
    'Calculadora de litros de pintura para paredes y techos',
    'Estimador de tarima y parquet con cortes incluidos',
    'Cálculo de sacos de mortero o adhesivo cerámico',
    'Estimación de coste total por material',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
