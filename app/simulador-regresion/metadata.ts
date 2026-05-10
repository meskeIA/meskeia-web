import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Regresión Lineal y Logística | meskeIA',
  description: 'Simula regresión lineal, polinómica y logística añadiendo puntos al plano. Observa cómo se ajusta el modelo en tiempo real con OLS o descenso de gradiente. Estadística e Inteligencia Artificial.',
  keywords: 'regresión lineal, regresión logística, regresión polinómica, descenso de gradiente, OLS mínimos cuadrados, R², machine learning básico, IA universidad, FP informática, ajuste de curvas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-regresion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Regresión Lineal y Logística | meskeIA',
    description: 'Añade puntos y observa el modelo ajustarse en tiempo real',
    url: 'https://meskeia.com/simulador-regresion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Regresión | meskeIA',
    description: 'Aprende ML básico con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Regresión Lineal y Logística',
  description: 'Simulador interactivo de regresión lineal, polinómica y logística. Añade puntos al plano con clic, elige el método (OLS analítico o descenso de gradiente), observa el ajuste en tiempo real y compara métricas.',
  url: 'https://meskeia.com/simulador-regresion/',
  category: 'EducationalApplication',
  features: [
    '4 modelos: lineal, lineal múltiple, polinómica (grado 1-5) y logística',
    'Editor de puntos con clic y arrastre',
    'OLS analítico vs descenso de gradiente animado',
    'Métricas: R², MSE, accuracy, precision, recall',
    'Curva de pérdida durante el entrenamiento',
    '4 datasets predefinidos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['regresión', 'machine learning', 'descenso gradiente', 'IA universidad'],
});
