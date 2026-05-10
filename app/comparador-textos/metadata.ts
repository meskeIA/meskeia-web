import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador de Textos - Encuentra Diferencias (Diff) | meskeIA',
  description: 'Compara dos textos y encuentra las diferencias. Resalta líneas añadidas, eliminadas y modificadas estilo diff. Gratis, privado y sin registro.',
  keywords: 'comparador textos, diff online, comparar archivos, diferencias texto, text compare, encontrar cambios, merge, comparar codigo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Textos Online - Diff',
    description: 'Compara dos textos lado a lado y encuentra todas las diferencias. Herramienta gratuita.',
    url: 'https://meskeia.com/comparador-textos/',
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
    title: 'Comparador de Textos | meskeIA',
    description: 'Encuentra diferencias entre dos textos con resaltado visual',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador de Textos meskeIA',
  },
};
