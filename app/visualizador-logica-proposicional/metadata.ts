import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lógica Proposicional: Tablas de Verdad, Karnaugh y Formas Normales | meskeIA',
  description: 'Visualizador interactivo de lógica proposicional. Tablas de verdad para AND/OR/NOT/XOR, evaluador de fórmulas con 3 variables, mapas de Karnaugh SVG y formas normales FNC/FND.',
  keywords: 'lógica proposicional, tablas de verdad AND OR NOT, mapa de Karnaugh simplificación, FNC FND forma normal, lógica matemática bachillerato, conectores lógicos tautología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lógica Proposicional: Tablas de Verdad, Karnaugh y Formas Normales',
    description: '¿Cómo funcionan los conectores lógicos? Explora AND, OR, NOT, XOR, implicación y equivalencia con tablas de verdad interactivas, mapas de Karnaugh SVG y formas normales FNC/FND.',
    url: 'https://meskeia.com/visualizador-logica-proposicional',
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
    title: 'Lógica Proposicional Interactiva | meskeIA',
    description: 'Tablas de verdad, mapas de Karnaugh y formas normales FNC/FND en un visualizador interactivo para bachillerato y universidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Lógica Proposicional meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Lógica Proposicional',
  description: 'Visualizador interactivo de lógica proposicional: tablas de verdad para los 6 conectores lógicos, evaluador de fórmulas con hasta 3 variables, mapas de Karnaugh SVG interactivos y formas normales FNC/FND con ejemplos clásicos.',
  url: 'https://meskeia.com/visualizador-logica-proposicional/',
  features: [
    'Tabla de verdad interactiva para AND, OR, NOT, XOR, implicación y equivalencia',
    'Toggles P/Q/R para ver resultados en tiempo real con colores V/F',
    'Evaluador de fórmulas con tabla de verdad completa de hasta 8 filas',
    'Ejemplos predefinidos: tautología, contradicción y contingencia',
    'Mapa de Karnaugh SVG de 2 y 3 variables con clic en celdas',
    'Agrupación automática de 1s y expresión SOP simplificada',
    'Formas Normales Conjuntiva (FNC) y Disyuntiva (FND) para 3 variables',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
  category: 'EducationalApplication',
});
