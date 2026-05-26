import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Limpiador de Texto Online Gratis - Quita Espacios, Duplicados y Formato',
  description: 'Limpia texto al instante: elimina espacios sobrantes, líneas duplicadas, saltos de línea, caracteres especiales y formato copiado. Pega, limpia y copia. Sin registro.',
  keywords: 'limpiador texto, eliminar espacios, quitar duplicados, limpiar texto, formatear texto, eliminar lineas vacias, text cleaner, remover caracteres',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Limpiador de Texto Online Gratis - Quita Espacios y Duplicados',
    description: 'Limpia texto al instante: elimina espacios, líneas duplicadas, saltos y caracteres especiales. Pega, limpia y copia.',
    url: 'https://meskeia.com/limpiador-texto/',
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
    title: 'Limpiador de Texto Online Gratis',
    description: 'Quita espacios, líneas duplicadas y formato. Pega, limpia y copia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Limpiador de Texto meskeIA',
  },
};
