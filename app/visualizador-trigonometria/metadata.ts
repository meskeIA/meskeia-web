import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
  description: 'Explora la trigonometría de forma visual e interactiva: círculo unitario animado, gráficas de seno, coseno y tangente con sliders de amplitud, frecuencia y fase, tabla de valores exactos en ángulos notables e identidades pitagóricas.',
  keywords: 'trigonometría, círculo unitario, seno, coseno, tangente, funciones trigonométricas, identidades pitagóricas, ángulos notables, bachillerato, matemáticas, visualizador interactivo, radianes, grados, ondas, amplitud, frecuencia, fase',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
    description: 'Aprende trigonometría con visualizaciones interactivas: círculo unitario, gráficas de sen/cos/tan con sliders y tabla de valores exactos.',
    url: 'https://meskeia.com/visualizador-trigonometria',
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
    title: 'Trigonometría: Círculo Unitario Interactivo — meskeIA',
    description: 'Círculo unitario animado, gráficas con sliders de amplitud/frecuencia/fase e identidades pitagóricas visualizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Trigonometría meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Trigonometría — Círculo Unitario Interactivo',
  description: 'Herramienta educativa interactiva para explorar trigonometría: círculo unitario animado con proyecciones de seno y coseno, gráficas con sliders de amplitud, frecuencia y fase, tabla de valores exactos en ángulos notables e identidades pitagóricas.',
  url: 'https://meskeia.com/visualizador-trigonometria/',
  category: 'EducationalApplication',
  features: [
    'Círculo unitario animado con slider de ángulo 0-360°',
    'Proyecciones de seno y coseno en tiempo real',
    'Línea de tangente con valor numérico',
    'Gráficas de sin(x), cos(x) y tan(x) con sliders',
    'Control de amplitud, frecuencia y fase',
    'Tabla de valores exactos en ángulos notables',
    'Visualización de identidades pitagóricas',
    'Modo identidades con cuadrado del radio',
  ],
});
