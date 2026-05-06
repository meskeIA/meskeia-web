import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Series y Convergencia: Taylor, Leibniz, Nilakantha | meskeIA',
  description: 'Explora series de Taylor/Maclaurin con slider interactivo, criterios de convergencia animados y cálculo de π con series de Leibniz, Nilakantha y Wallis.',
  keywords: [
    'series de Taylor',
    'series de Maclaurin',
    'convergencia de series',
    'criterio de la razón',
    'serie de Leibniz',
    'serie de Nilakantha',
    'número pi series',
    'aproximación polinómica',
    'radio de convergencia',
    'sumas parciales',
    'visualizador matemáticas',
    'análisis matemático',
  ],
  openGraph: {
    title: 'Visualizador de Series y Convergencia',
    description: 'Series de Taylor animadas con slider de términos, criterios de convergencia y cálculo de π con tres series clásicas.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Series y Convergencia',
  description: 'Explora series de Taylor/Maclaurin con slider interactivo, criterios de convergencia animados y cálculo de π con series de Leibniz, Nilakantha y Wallis.',
  url: 'https://meskeia.com/visualizador-series-convergencia',
  features: [
    'Series de Taylor y Maclaurin con slider de términos (N=1–15)',
    'Gráfica función real vs aproximación polinómica en SVG',
    'Error residual con barra de progreso',
    'Criterios de convergencia: razón, comparación, alternado',
    'Sumas parciales animadas hasta N=50',
    'Cálculo de π con series de Leibniz, Nilakantha y Wallis',
    'Tabla comparativa de decimales correctos por número de términos',
  ],
  category: 'EducationalApplication',
  keywords: ['series Taylor', 'convergencia', 'pi series', 'Maclaurin', 'Leibniz', 'Nilakantha'],
});
