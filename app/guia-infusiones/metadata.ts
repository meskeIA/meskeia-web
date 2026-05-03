import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Infusiones - Usos tradicionales y preparación | meskeIA',
  description: 'Directorio de 55 plantas para infusión: usos tradicionales, temperatura, tiempo de infusión, contraindicaciones y combinaciones. Filtros por familia (digestiva, relajante, estimulante...).',
  keywords: 'infusiones plantas medicinales, manzanilla, tila, jengibre, cúrcuma, valeriana, hibisco, usos tradicionales plantas, cómo preparar infusiones, fitoterapia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Infusiones | meskeIA',
    description: 'Consulta los usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión. Filtros por familia.',
    url: 'https://meskeia.com/guia-infusiones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Infusiones | meskeIA',
    description: 'Directorio de 55 infusiones: usos tradicionales, preparación y contraindicaciones. Filtros por familia.',
  },
  other: {
    'application-name': 'Guía Infusiones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Infusiones',
  description: 'Directorio consultable de 55 plantas para infusión con usos tradicionales populares, instrucciones de preparación (temperatura, tiempo, cantidad), contraindicaciones conocidas y plantas con las que combinan. Filtros por 8 familias: digestiva, relajante, estimulante, depurativa, respiratoria, antiinflamatoria, antioxidante y adaptógena.',
  url: 'https://meskeia.com/guia-infusiones/',
  features: [
    'Búsqueda por nombre o uso tradicional',
    'Filtros por 8 familias de infusiones',
    '55 plantas con perfil completo',
    'Instrucciones de preparación (temperatura, tiempo, cantidad)',
    'Contraindicaciones conocidas por planta',
    'Con qué otras infusiones combina',
    'Funciona 100% en el navegador, sin registro',
  ],
});
