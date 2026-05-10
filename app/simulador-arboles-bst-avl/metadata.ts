import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Árboles BST y AVL - Inserción Borrado Rotaciones | meskeIA',
  description: 'Simula árboles binarios de búsqueda y AVL paso a paso. Inserta y elimina nodos, observa rotaciones LL, RR, LR, RL y los 4 recorridos (inorden, preorden, postorden, niveles). Estructuras de Datos.',
  keywords: 'BST árbol binario búsqueda, árbol AVL, rotaciones LL RR LR RL, factor balance, recorridos árbol inorden preorden, estructuras datos universidad, FP informática, algoritmia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-arboles-bst-avl/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Árboles BST y AVL | meskeIA',
    description: 'Inserciones, borrados y rotaciones AVL animadas paso a paso',
    url: 'https://meskeia.com/simulador-arboles-bst-avl/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Árboles BST y AVL | meskeIA',
    description: 'Aprende árboles binarios con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Árboles BST y AVL',
  description:
    'Simulador interactivo de árboles binarios de búsqueda (BST) y AVL auto-balanceados. Inserta, elimina y busca nodos, observa las rotaciones LL/RR/LR/RL animadas y los 4 recorridos clásicos.',
  url: 'https://meskeia.com/simulador-arboles-bst-avl/',
  category: 'EducationalApplication',
  features: [
    'Modos BST simple y AVL auto-balanceado',
    'Inserción, borrado y búsqueda animadas',
    'Rotaciones LL, RR, LR, RL paso a paso',
    'Factor de balance visible en cada nodo (AVL)',
    '4 recorridos: inorden, preorden, postorden, niveles',
    '4 ejemplos clásicos (inserción ordenada, rotación simple/doble, balanceado)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['BST', 'AVL', 'árboles binarios', 'estructuras de datos'],
});
