import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Funciones que Gobiernan el Mundo - Matemáticas Visuales | meskeIA',
  description: 'Lineal, exponencial, logarítmica y cuadrática: las 4 funciones que explican el mundo real. Cada una con ejemplo cotidiano, gráfico interactivo y slider.',
  keywords: 'funciones matemáticas, lineal, exponencial, logarítmica, cuadrática, bachillerato, matemáticas visual, gráficos interactivos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Funciones que Gobiernan el Mundo',
    description: 'Las 4 funciones matemáticas que explican la realidad, con ejemplos cotidianos.',
    url: 'https://meskeia.com/visualizador-funciones-mundo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Funciones que Gobiernan el Mundo',
    description: 'Lineal, exponencial, logarítmica y cuadrática con ejemplos reales.',
  },
  other: { 'application-name': 'Funciones Mundo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Funciones que Gobiernan el Mundo',
  description: 'Explicador visual de las 4 funciones matemáticas fundamentales: lineal (crecimiento salarial), exponencial (virus, interés compuesto), logarítmica (Richter, decibelios) y cuadrática (trayectorias). Gráficos interactivos con sliders.',
  url: 'https://meskeia.com/visualizador-funciones-mundo/',
  features: [
    '4 funciones con ejemplos del mundo real',
    'Gráficos Chart.js interactivos con sliders',
    'Comparativa visual de las 4 funciones superpuestas',
    'Explicación intuitiva sin fórmulas complejas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
