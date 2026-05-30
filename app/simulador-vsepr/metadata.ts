import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador VSEPR - Geometría Molecular 3D | meskeIA',
  description: 'Construye moléculas con la teoría VSEPR: ajusta pares enlazantes y libres del átomo central y observa la geometría 3D rotable. Lineal, tetraédrica, octaédrica y más. Química Bachillerato.',
  keywords: 'VSEPR, geometría molecular, geometría 3D molecular, pares libres, AX2 AX3 AX4 AX5 AX6, hibridación, química bachillerato, ángulo enlace',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-vsepr/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador VSEPR - Geometría Molecular 3D | meskeIA',
    description: 'Geometría molecular 3D rotable según teoría VSEPR',
    url: 'https://meskeia.com/simulador-vsepr/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador VSEPR | meskeIA',
    description: 'Geometría molecular 3D interactiva',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador VSEPR de Geometría Molecular',
  description: 'Simulador interactivo de geometría molecular según la teoría VSEPR. Ajusta pares enlazantes y pares libres del átomo central y observa la geometría 3D resultante con rotación libre.',
  url: 'https://meskeia.com/simulador-vsepr/',
  category: 'EducationalApplication',
  features: [
    'Construcción de moléculas AX_nE_m con pares enlazantes y libres',
    'Geometría 3D rotable con drag & drop',
    'Cálculo de geometría electrónica vs geometría molecular',
    'Ángulos de enlace ideales',
    'Ejemplos famosos para cada geometría (H2O, NH3, CH4, PCl5, SF6, XeF4...)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['VSEPR', 'geometría molecular', 'pares libres', 'química bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la teoría VSEPR y cómo predice la geometría molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La teoría VSEPR (Repulsión de Pares de Electrones de la Capa de Valencia) establece que los pares de electrones alrededor de un átomo central se alejan entre sí para minimizar la repulsión. A partir del número de pares enlazantes y pares libres se deduce la geometría electrónica y, descontando los pares libres, la geometría molecular real (forma observable).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ángulo del agua (104,5°) es menor que el del metano (109,5°)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua tiene geometría electrónica tetraédrica (2 pares enlazantes + 2 pares libres). Los pares libres ocupan más espacio angular que los pares enlazantes porque están más cerca del núcleo y ejercen mayor repulsión, comprimiendo el ángulo H-O-H hasta 104,5°, frente a los 109,5° del metano, que no tiene pares libres.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre geometría electrónica y geometría molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La geometría electrónica describe la disposición de todos los pares de electrones (enlazantes y libres) alrededor del átomo central. La geometría molecular solo considera la posición de los átomos, ignorando los pares libres. Por ejemplo, el NH₃ tiene geometría electrónica tetraédrica, pero geometría molecular piramidal trigonal porque uno de los cuatro pares es libre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué moléculas tienen geometría lineal según VSEPR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tienen geometría lineal las moléculas con solo 2 pares enlazantes y ningún par libre (AX₂), como CO₂ (dióxido de carbono) y BeF₂, con ángulo de enlace de 180°. También adoptan geometría lineal moléculas AX₂E₃ como XeF₂, donde 3 pares libres ecuatoriales fuerzan a los 2 átomos F a posiciones axiales opuestas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación hay entre VSEPR e hibridación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VSEPR predice la geometría a partir de la repulsión electrónica; la hibridación es el modelo de enlace que la justifica matemáticamente. Geometría lineal → sp; trigonal plana → sp²; tetraédrica → sp³; bipiramidal trigonal → sp³d; octaédrica → sp³d². Ambos modelos coinciden en sus predicciones geométricas, aunque VSEPR no requiere conocer los orbitales d.',
      },
    },
  ],
};
