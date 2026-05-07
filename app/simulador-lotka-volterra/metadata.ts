import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Depredador-Presa - Modelo Lotka-Volterra | meskeIA',
  description: 'Simula la dinámica de poblaciones depredador-presa con el modelo Lotka-Volterra. Observa ciclos, extinciones y equilibrios. Biología y ecología matemática Universidad.',
  keywords: 'Lotka-Volterra, depredador presa, dinámica poblaciones, ecología matemática, ecosistema simulador, biología Universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-lotka-volterra/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Depredador-Presa | meskeIA',
    description: 'Modelo Lotka-Volterra interactivo: oscilaciones, extinciones y equilibrios de ecosistemas',
    url: 'https://meskeia.com/simulador-lotka-volterra',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Depredador-Presa | meskeIA',
    description: 'Aprende ecología matemática con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Depredador-Presa Lotka-Volterra',
  description: 'Simulador interactivo del modelo Lotka-Volterra para dinámica de poblaciones. Ajusta parámetros (tasa reproducción presa, depredación, conversión, mortalidad) y observa oscilaciones, extinciones y equilibrios.',
  url: 'https://meskeia.com/simulador-lotka-volterra/',
  category: 'EducationalApplication',
  features: [
    'Ecuaciones diferenciales Lotka-Volterra interactivas',
    'Modo clásico vs modo con capacidad de carga (logística)',
    'Gráfico temporal x(t), y(t) y diagrama de fases',
    '4 presets: linces y liebres, sobrepesca, equilibrio, caos',
    'Detección automática de picos, colapsos y extinciones',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['Lotka-Volterra', 'ecología', 'dinámica poblaciones', 'biología'],
});
