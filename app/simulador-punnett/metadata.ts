import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuadro de Punnett: Genética Mendeliana | meskeIA',
  description:
    'Simula cruces genéticos monohíbridos y dihíbridos con el cuadro de Punnett. Calcula proporciones genotípicas y fenotípicas. Herramienta interactiva para aprender las leyes de Mendel.',
  keywords:
    'cuadro de Punnett, genética, Mendel, genotipo, fenotipo, herencia, alelos, dominante, recesivo, monohíbrido, dihíbrido, EBAU, Bachillerato, biología, leyes de Mendel',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-punnett/',
  },
  openGraph: {
    type: 'website',
    title: 'Cuadro de Punnett: Genética Mendeliana | meskeIA',
    description:
      'Simula cruces genéticos monohíbridos y dihíbridos. Proporciones genotípicas y fenotípicas instantáneas.',
    url: 'https://meskeia.com/simulador-punnett/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuadro de Punnett | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas de cruces',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Cuadro de Punnett — Genética Mendeliana',
  description:
    'Simulador interactivo del cuadro de Punnett para cruces monohíbridos y dihíbridos. Calcula proporciones genotípicas y fenotípicas, visualiza gametos y explora escenarios predefinidos de las leyes de Mendel.',
  url: 'https://meskeia.com/simulador-punnett/',
  category: 'EducationalApplication',
  features: [
    'Cruce monohíbrido (4 celdas) y dihíbrido (16 celdas)',
    'Cuadro de Punnett renderizado con colores por fenotipo',
    'Proporciones genotípicas y fenotípicas automáticas',
    'Escenarios predefinidos: Mendel clásico, portador, puro × recesivo',
    'Botón de caso aleatorio para explorar combinaciones',
    'Interpretación en texto natural de los resultados',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: [
    'cuadro de Punnett',
    'genética mendeliana',
    'genotipo fenotipo',
    'leyes de Mendel',
    'herencia biológica',
    'Bachillerato biología',
  ],
});
