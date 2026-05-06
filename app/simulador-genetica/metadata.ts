import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Genética Mendeliana - Cruces y Herencia | meskeIA',
  description: 'Simula cruces genéticos y visualiza la herencia mendeliana. Cuadros de Punnett, árboles genealógicos, herencia ligada al sexo y simulación de poblaciones.',
  keywords: 'genética, Mendel, herencia, cuadro de Punnett, pedigree, alelos, genotipo, fenotipo, dominante, recesivo, dihíbrido, cromosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Visualiza cruces genéticos, cuadros de Punnett y herencia mendeliana de forma interactiva',
    url: 'https://meskeia.com/simulador-genetica',
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
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Genética Mendeliana',
  description: 'Simulador interactivo de cruces genéticos y herencia mendeliana. Genera cuadros de Punnett, árboles genealógicos, herencia ligada al sexo y simulación de poblaciones para entender genotipos y fenotipos.',
  url: 'https://meskeia.com/simulador-genetica/',
  category: 'EducationalApplication',
  features: [
    'Generador de cuadros de Punnett (mono y dihíbridos)',
    'Visualización de cruces genéticos paso a paso',
    'Herencia ligada al sexo y autosómica',
    'Árboles genealógicos (pedigrees)',
    'Simulación de frecuencias alélicas en poblaciones',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['genética', 'Mendel', 'cuadro de Punnett', 'herencia', 'bachillerato', 'biología'],
});
