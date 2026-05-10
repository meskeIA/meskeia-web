import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Distribución Normal — Curva de Gauss Interactiva | meskeIA',
  description: 'Visualiza la distribución normal moviendo media (μ) y desviación típica (σ). Calcula probabilidades, áreas, puntuaciones Z y la regla 68-95-99.7 paso a paso.',
  keywords: 'distribución normal, curva de Gauss, campana de Gauss, media, desviación típica, puntuación Z, tipificación, regla 68-95-99.7, estadística, probabilidad, EBAU, selectividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-distribucion-normal/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Distribución Normal | meskeIA',
    description: 'Mueve μ y σ y observa cómo cambia la curva de Gauss. Calcula probabilidades y puntuaciones Z visualmente.',
    url: 'https://meskeia.com/simulador-distribucion-normal/',
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
    title: 'Simulador de Distribución Normal | meskeIA',
    description: 'Visualiza la curva de Gauss y calcula probabilidades de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Distribución Normal',
  description: 'Simulador interactivo de la distribución normal o campana de Gauss. Manipula la media (μ) y la desviación típica (σ) para ver cómo cambia la curva en tiempo real, calcula probabilidades de tramos, puntuaciones Z (tipificación) y aprende visualmente la regla empírica 68-95-99.7.',
  url: 'https://meskeia.com/simulador-distribucion-normal/',
  category: 'EducationalApplication',
  features: [
    'Manipulación interactiva de μ (media) y σ (desviación típica)',
    'Cálculo automático de probabilidades P(X<a), P(X>a), P(a<X<b)',
    'Tipificación a puntuación Z y comparación con N(0,1)',
    'Visualización de la regla 68-95-99.7 sombreada',
    'Problemas tipo predefinidos (alturas, calificaciones, control de calidad)',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'En español, ideal para EBAU, Bachillerato y universidad',
  ],
  keywords: ['distribución normal', 'Gauss', 'estadística', 'probabilidad', 'puntuación Z', 'EBAU', 'Bachillerato'],
});
