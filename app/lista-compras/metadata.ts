import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lista de Compras Inteligente - Organizador de Supermercado | meskeIA',
  description: '¿Necesitas organizar tu lista del supermercado? Añade productos con categorías automáticas, marca comprados y guarda tus listas. Funciona offline.',
  keywords: [
    'lista compras',
    'lista supermercado',
    'organizador compras',
    'lista productos',
    'compra semanal',
    'lista mercado',
    'app compras',
    'lista alimentos',
    'planificador compras',
    'lista groceries',
    'supermercado online',
    'lista offline',
    'compras organizadas',
    'meskeIA'
  ],
  authors: [{ name: 'meskeIA', url: 'https://meskeia.com' }],
  openGraph: {
    type: 'website',
    title: 'Lista de Compras Inteligente - Organizador de Supermercado',
    description: 'Organiza tu lista de compras por categorías automáticas. Añade productos, marca comprados y guarda tus listas offline.',
    url: 'https://meskeia.com/beta/lista-compras',
    siteName: 'meskeIA',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lista de Compras Inteligente - meskeIA',
    description: 'Organiza tu lista de compras por categorías. Funciona offline con almacenamiento local.'
  },
  alternates: {
    canonical: 'https://meskeia.com/beta/lista-compras'
  },
  robots: {
    index: true,
    follow: true
  }
};
