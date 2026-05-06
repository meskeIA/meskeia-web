import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Epigenética: Cómo el Entorno Modifica la Expresión Génica — meskeIA',
  description:
    'Visualizador de epigenética: metilación del ADN, modificaciones de histonas, imprinting genómico y factores que modifican el epigenoma. Sin alterar el ADN.',
  keywords: [
    'epigenética',
    'metilación del ADN',
    'modificaciones de histonas',
    'acetilación histonas',
    'imprinting genómico',
    'expresión génica',
    'cromatina abierta compacta',
    'reloj de Horvath',
    'epigenética y cáncer',
    'herencia transgeneracional',
    'BRCA1 metilación',
    'nucleosoma',
  ],
  openGraph: {
    title: 'Epigenética: Cómo el Entorno Modifica la Expresión Génica — meskeIA',
    description:
      'Metilación del ADN, histonas, imprinting genómico y factores epigenéticos. El entorno modifica la lectura del ADN sin alterar la secuencia.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
