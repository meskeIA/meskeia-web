import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Álgebra Lineal — Vectores, Transformaciones y Eigenvalores | meskeIA',
  description: 'Explora álgebra lineal geométricamente: vectores 2D con producto escalar, transformaciones lineales animadas (rotación, escala, cizalla), determinante como área del paralelogramo y eigenvalores/eigenvectores como ejes invariantes.',
  keywords: 'álgebra lineal, vectores, transformaciones lineales, determinante, eigenvalores, eigenvectores, matrices 2x2, producto escalar, PCA, geometría lineal, matemáticas, visualizador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Álgebra Lineal — Vectores, Transformaciones y Eigenvalores',
    description: '¿Qué es realmente una transformación lineal? Explora la geometría del álgebra lineal: vectores, matrices como transformaciones, el determinante como área y los eigenvalores como ejes invariantes.',
    url: 'https://meskeia.com/visualizador-algebra-lineal',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Álgebra Lineal',
    description: 'Geometría del álgebra lineal: vectores, transformaciones matriciales, determinante como área y eigenvalores interactivos.',
  },
  other: { 'application-name': 'Álgebra Lineal meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Álgebra Lineal',
  description: 'Visualizador interactivo de álgebra lineal geométrica: vectores 2D con producto escalar y ángulo, transformaciones lineales con cuadrícula animada, determinante como área del paralelogramo y eigenvalores/eigenvectores con visualización de ejes invariantes.',
  url: 'https://meskeia.com/visualizador-algebra-lineal/',
  features: [
    'Vectores 2D interactivos: suma, producto escalar, ángulo entre vectores',
    'Transformaciones lineales 2×2 con cuadrícula transformada animada',
    'Presets: rotación, escala, cizalla, reflexión, identidad',
    'Determinante como área del paralelogramo visualizada',
    'Eigenvalores y eigenvectores para matrices simétricas 2×2',
    'Cálculo exacto de eigenvalores mediante fórmula analítica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
  category: 'EducationalApplication',
});
