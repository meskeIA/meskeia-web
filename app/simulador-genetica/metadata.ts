import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Genética Mendeliana - Cruces y Herencia | meskeIA',
  description: 'Simula cruces genéticos y visualiza la herencia mendeliana. Cuadros de Punnett, árboles genealógicos, herencia ligada al sexo y simulación de poblaciones.',
  keywords: 'genética, Mendel, herencia, cuadro de Punnett, pedigree, alelos, genotipo, fenotipo, dominante, recesivo, dihíbrido, cromosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Visualiza cruces genéticos, cuadros de Punnett y herencia mendeliana de forma interactiva',
    url: 'https://meskeia.com/simulador-genetica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Genética Mendeliana | meskeIA',
    description: 'Aprende genética mendeliana con simulaciones interactivas',
  },
};
