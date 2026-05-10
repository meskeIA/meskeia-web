import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión — meskeIA',
  description: 'Visualizador interactivo de teoría de la información. Entropía de Shannon con sliders, árbol de Huffman animado, capacidad del canal Shannon-Hartley y comparativa de formatos de compresión.',
  keywords: [
    'entropía Shannon bits información',
    'código Huffman árbol compresión',
    'capacidad canal Shannon-Hartley',
    'compresión sin pérdida lossless',
    'MP3 JPEG PNG comparativa tamaño',
    'teoría información telecomunicaciones',
    'información mutua probabilidad',
    'compresión datos educativo',
    'ancho de banda SNR capacidad canal',
    'Claude Shannon matemáticas información',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión — meskeIA',
    description: 'Visualizador interactivo: entropía de Shannon, árbol de Huffman, capacidad Shannon-Hartley y comparativa de formatos de compresión. Educativo y gratuito.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-teoria-informacion/',
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
    title: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión',
    description: 'Ajusta probabilidades y ve la entropía en tiempo real. Árbol Huffman, canal Shannon-Hartley y formatos de compresión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Teoría de la Información Visualizador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Teoría de la Información: Entropía de Shannon, Huffman y Compresión',
  description: 'Visualizador interactivo de teoría de la información de Shannon. Permite explorar la entropía de Shannon con sliders, el árbol de Huffman con ejemplo paso a paso, la capacidad del canal Shannon-Hartley y la comparativa de formatos de compresión (WAV, MP3, BMP, PNG, JPEG). 100% educativo, sin registro.',
  url: 'https://meskeia.com/visualizador-teoria-informacion/',
  category: 'EducationalApplication',
  features: [
    'Entropía de Shannon con 4 sliders de probabilidad en tiempo real',
    'Árbol de Huffman SVG con tabla de códigos y comparativa de eficiencia',
    'Capacidad del canal Shannon-Hartley: sliders de B y SNR, curva SVG',
    'Comparativa de formatos: WAV vs MP3, BMP vs PNG vs JPEG',
    'Slider de calidad JPEG con estimación de tamaño',
    'Visualizaciones SVG proporcionales al tamaño de archivo',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
