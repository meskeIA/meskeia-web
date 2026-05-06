import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lista de Compras - Organiza tu Supermercado | meskeIA',
  description: 'Lista de compras inteligente con organización automática por categorías del supermercado. Guarda tus listas en el navegador, comparte y exporta. Gratis y sin registro.',
  keywords: 'lista compras, supermercado, lista supermercado, organizar compras, lista compra online, shopping list, mercado, productos, categorias, offline',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lista de Compras Inteligente - Organiza tu Supermercado',
    description: 'Crea y organiza tu lista de compras por categorías. Guarda en el navegador y comparte fácilmente.',
    url: 'https://meskeia.com/lista-compras',
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
    title: 'Lista de Compras | meskeIA',
    description: 'Lista de compras inteligente con organización por categorías',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Lista de Compras meskeIA',
  },
};
