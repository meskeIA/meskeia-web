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
    url: 'https://next.meskeia.com/lista-compras',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lista de Compras | meskeIA',
    description: 'Lista de compras inteligente con organización por categorías',
  },
  other: {
    'application-name': 'Lista de Compras meskeIA',
  },
};
