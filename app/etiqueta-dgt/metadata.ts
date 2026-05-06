import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Etiqueta DGT de tu Coche — ¿Puedes entrar en las ZBE? | meskeIA',
  description:
    'Descubre la etiqueta medioambiental DGT de tu vehículo y si puedes circular por las Zonas de Bajas Emisiones de Madrid, Barcelona, Valencia y otras ciudades españolas.',
  keywords: [
    'etiqueta DGT coche',
    'zona de bajas emisiones España',
    'ZBE Madrid Barcelona',
    'etiqueta CERO ECO C B DGT',
    'puedo entrar en ZBE',
    'restricciones tráfico contaminación',
    'etiqueta ambiental vehículo',
    'circular Madrid centro',
  ],
  openGraph: {
    title: '¿Qué etiqueta DGT tiene tu coche? ¿Puedes entrar en las ZBE? | meskeIA',
    description:
      'Comprueba la etiqueta medioambiental de tu vehículo y accede a la información de circulación en las ZBE de las principales ciudades de España.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/etiqueta-dgt/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Etiqueta DGT y ZBE — ¿Puedes circular? | meskeIA',
    description:
      'Introduce el combustible y año de tu coche para conocer tu etiqueta DGT y si puedes entrar en las zonas de bajas emisiones.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/etiqueta-dgt/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Etiqueta DGT y Zonas de Bajas Emisiones',
        description:
          'Consulta la etiqueta medioambiental DGT de tu vehículo y comprueba si puedes circular por las Zonas de Bajas Emisiones de Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Valladolid y Bilbao.',
        url: 'https://meskeia.com/etiqueta-dgt/',
        features: [
          'Cálculo de etiqueta DGT (CERO, ECO, C, B o sin etiqueta)',
          'Consulta de acceso a 7 ZBE principales de España',
          'Información sobre restricciones por nivel de contaminación',
          'Recomendaciones según etiqueta y ciudad',
          '100% en el navegador, sin registro',
          'Datos actualizados a 2025',
          'Gratuito y en español',
        ],
      })
    ),
  },
};
