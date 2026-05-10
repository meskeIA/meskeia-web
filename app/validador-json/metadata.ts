import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validador JSON y XML - Formatea y Minifica Código | meskeIA',
  description: 'Valida, formatea y minifica código JSON y XML al instante. Detecta errores de sintaxis, muestra línea del error y genera código limpio.',
  keywords: 'validador json, validador xml, formatear json, minificar json, json validator, xml validator, prettify, beautify',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validador JSON y XML',
    description: 'Valida, formatea y minifica código JSON y XML al instante con detección de errores.',
    url: 'https://meskeia.com/validador-json/',
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
    title: 'Validador JSON y XML',
    description: 'Valida y formatea código JSON/XML online.',
    images: ['https://meskeia.com/og-image.png']
  },
};
