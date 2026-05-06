import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insulina y Glucosa - Cómo Regula tu Cuerpo el Azúcar | meskeIA',
  description: 'Entiende cómo funciona la insulina: curva de glucosa tras las comidas, mecanismo de acción celular, diferencia entre resistencia insulínica y diabetes tipo 1 vs tipo 2. Solo educativo.',
  keywords: ['insulina glucosa', 'como funciona insulina', 'glucosa sangre', 'resistencia insulinica', 'diabetes tipo 2 mecanismo', 'indice glucemico', 'pico glucemia', 'pancreas insulina', 'metabolismo glucosa'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Insulina y Glucosa | meskeIA',
    description: 'Cómo regula el cuerpo el azúcar en sangre: insulina, glucosa y metabolismo.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-insulina-glucosa/',
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
    title: 'Insulina y Glucosa | meskeIA',
    description: 'Cómo regula el cuerpo el azúcar en sangre: insulina, glucosa y metabolismo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Insulina y Glucosa meskeIA',
  },
};
