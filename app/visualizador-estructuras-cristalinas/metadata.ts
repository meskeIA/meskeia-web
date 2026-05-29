import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructuras Cristalinas 3D - Los 7 Sistemas y Celdas Rotables | meskeIA',
  description: 'Visualiza en 3D los 7 sistemas cristalinos, estructuras BCC/FCC/HCP, sal, diamante y grafito. Arrastra para rotar las celdas unitarias.',
  keywords: 'estructuras cristalinas, cristalografía, celda unitaria, BCC, FCC, HCP, sistemas cristalinos, 3D, diamante, grafito, NaCl',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructuras Cristalinas 3D - Celdas Unitarias Rotables',
    description: 'Arrastra para rotar celdas unitarias en 3D: los 7 sistemas cristalinos, BCC, FCC, HCP, sal, diamante y grafito.',
    url: 'https://meskeia.com/visualizador-estructuras-cristalinas/',
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
    title: 'Estructuras Cristalinas 3D',
    description: 'Los 7 sistemas cristalinos con rotación interactiva en 3D.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estructuras Cristalinas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructuras Cristalinas 3D - Los 7 Sistemas y Celdas Rotables',
  description: 'Visualizador interactivo de estructuras cristalinas en 3D con arrastre. Los 7 sistemas cristalinos, estructuras metálicas BCC/FCC/HCP, y cristales famosos como sal, diamante y grafito.',
  url: 'https://meskeia.com/visualizador-estructuras-cristalinas/',
  category: 'EducationalApplication',
  features: [
    'Celdas unitarias 3D rotables con arrastre (mouse y táctil)',
    '7 sistemas cristalinos con parámetros de celda',
    'Estructuras metálicas BCC, FCC y HCP',
    'Cristales famosos: sal, diamante, grafito, cuarzo',
    'CSS 3D sin dependencias externas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una estructura cristalina y qué la diferencia de un material amorfo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una estructura cristalina es la disposición ordenada y periódica de átomos, iones o moléculas que se repite en las tres dimensiones del espacio. Esta regularidad le da al cristal propiedades físicas definidas y caras planas visibles. Un material amorfo, como el vidrio o el plástico, carece de este orden a largo alcance, por lo que sus átomos están distribuidos de forma irregular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los 7 sistemas cristalinos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los 7 sistemas cristalinos se clasifican según los parámetros de celda (longitudes a, b, c y ángulos α, β, γ): cúbico, tetragonal, ortorrómbico, hexagonal, trigonal (romboédrico), monoclínico y triclínico. El sistema cúbico es el más simétrico y el triclínico el menos. La sal y el diamante pertenecen al sistema cúbico; el cuarzo, al hexagonal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre las estructuras BCC, FCC y HCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BCC (cúbica centrada en el cuerpo) tiene un átomo en cada esquina y uno en el centro; es la estructura del hierro alfa y el wolframio. FCC (cúbica centrada en las caras) tiene átomos en esquinas y centros de cada cara; es la más compacta junto con HCP y corresponde al cobre, aluminio y oro. HCP (hexagonal compacta) apila capas en patrón ABABAB; es la estructura del titanio, magnesio y zinc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el grafito y el diamante tienen propiedades tan distintas si ambos son carbono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diamante y el grafito son alótropos del carbono: mismos átomos, estructura radicalmente diferente. En el diamante, cada átomo de carbono está unido a otros 4 en tetraedro (hibridación sp³), formando una red tridimensional rígida que lo convierte en el material natural más duro. En el grafito, cada átomo se une a 3 en planos hexagonales (sp²) que se deslizan fácilmente entre sí, haciéndolo blando y conductor eléctrico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil visualizar estructuras cristalinas en 3D?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este tipo de visualizador es especialmente útil para estudiantes de Química, Física de Estado Sólido, Ciencia de Materiales e Ingeniería que necesitan comprender la relación entre la estructura atómica y las propiedades macroscópicas. Rotar la celda unitaria ayuda a interiorizar conceptos como planos de deslizamiento, densidad de empaquetamiento y simetría que son difíciles de entender con representaciones estáticas.',
      },
    },
  ],
};
