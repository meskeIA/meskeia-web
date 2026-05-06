import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Prestaciones por Dependencia - SAAD España | meskeIA',
  description: 'Estima las prestaciones y servicios del SAAD según el grado de dependencia reconocido. Cuantías máximas 2025, servicios disponibles y copago orientativo.',
  keywords: 'prestaciones dependencia, SAAD España, PECEF, PEVS, ayuda domicilio dependencia, grado dependencia prestaciones, copago dependencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Prestaciones por Dependencia | meskeIA',
    description: 'Conoce las prestaciones del SAAD según tu grado de dependencia: cuantías, servicios y copago orientativo.',
    url: 'https://meskeia.com/estimacion-prestaciones-dependencia/',
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
    title: 'Estimación de Prestaciones por Dependencia | meskeIA',
    description: 'Prestaciones SAAD por grado de dependencia: cuantías máximas y servicios disponibles',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimación Prestaciones Dependencia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Prestaciones por Dependencia',
  description: 'Herramienta orientativa para estimar las prestaciones económicas y servicios del SAAD según el grado de dependencia reconocido en España. Incluye cuantías máximas 2025 y servicios del catálogo.',
  url: 'https://meskeia.com/estimacion-prestaciones-dependencia/',
  features: [
    'Prestaciones económicas por grado (PEVS, PECEF, PAP)',
    'Catálogo de servicios SAAD disponibles',
    'Cuantías máximas 2025 orientativas',
    'Información sobre copago y capacidad económica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
