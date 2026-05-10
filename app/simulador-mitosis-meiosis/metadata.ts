import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Mitosis y Meiosis - División Celular Interactiva | meskeIA',
  description:
    'Simulador visual animado de mitosis (6 fases) y meiosis (8 fases). Observa cómo se dividen las células con cromosomas, huso acromático y crossing-over. Ideal para Bachillerato y biología universitaria.',
  keywords:
    'mitosis, meiosis, división celular, cromosomas, crossing-over, gametos, célula, fases mitosis, fases meiosis, EBAU, Bachillerato, biología, haploide, diploide',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-mitosis-meiosis/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Mitosis y Meiosis | meskeIA',
    description:
      'Visualiza las fases de mitosis y meiosis con animación interactiva: cromosomas, huso y crossing-over',
    url: 'https://meskeia.com/simulador-mitosis-meiosis/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Mitosis y Meiosis | meskeIA',
    description: 'Aprende la división celular con visualizaciones interactivas paso a paso',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Mitosis y Meiosis',
  description:
    'Simulador interactivo de división celular que muestra las 6 fases de la mitosis y las 8 fases de la meiosis. Visualiza cromosomas, huso acromático, crossing-over y formación de células hijas con canvas 2D animado.',
  url: 'https://meskeia.com/simulador-mitosis-meiosis/',
  category: 'EducationalApplication',
  features: [
    'Simulación animada de las 6 fases de la mitosis',
    'Simulación animada de las 8 fases de la meiosis',
    'Visualización de cromosomas, huso acromático y crossing-over',
    'Control de velocidad: lenta, media y rápida',
    'Navegación manual fase a fase o reproducción automática',
    'Contador de células resultado con ploidy (2n/n)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: [
    'mitosis',
    'meiosis',
    'división celular',
    'cromosomas',
    'crossing-over',
    'biología bachillerato',
    'gametos',
    'célula',
  ],
});
