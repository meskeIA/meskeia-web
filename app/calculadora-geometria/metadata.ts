import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Geometría - Áreas, Perímetros y Volúmenes | meskeIA',
  description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas 2D y 3D. Triángulos, círculos, polígonos, esferas, cilindros y más.',
  keywords: 'geometría, área, perímetro, volumen, triángulo, círculo, esfera, cilindro, polígono, figuras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-geometria/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas.',
    url: 'https://meskeia.com/calculadora-geometria/',
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
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Herramienta completa de cálculos geométricos online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Geometría',
  description: 'Calculadora de geometría online: áreas, perímetros y volúmenes de figuras 2D y 3D. Triángulos, círculos, polígonos regulares, esferas, cilindros, conos y prismas, con la fórmula aplicada a la vista y el supuesto declarado cuando los datos no determinan el perímetro.',
  url: 'https://meskeia.com/calculadora-geometria/',
  category: 'EducationalApplication',
  features: [
    'Áreas y perímetros de 8 figuras planas: cuadrado, rectángulo, triángulo, círculo, trapecio, rombo, pentágono y hexágono',
    'Volúmenes y áreas superficiales de 6 sólidos: cubo, prisma, cilindro, esfera, cono y pirámide',
    'Perímetro exacto del triángulo cuando se conoce uno de sus lados, con el tercero calculado',
    'Declara el supuesto cuando los datos no determinan el perímetro (triángulo y trapecio isósceles)',
    'Comprueba que la apotema tecleada sea la que corresponde al polígono regular elegido',
    'Fórmula aplicada visible junto a cada resultado',
    'Resultados con cuatro decimales en formato español',
    'En español y sin registro',
  ],
  keywords: ['geometría', 'área', 'perímetro', 'volumen', 'figuras geométricas', 'estudiantes'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué figuras geométricas cubre esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cubre figuras planas (2D) como triángulos, cuadrados, rectángulos, círculos, trapecios y polígonos regulares, así como sólidos (3D) como esferas, cilindros, conos, cubos y prismas rectangulares. Para cada figura calcula el área, el perímetro o la superficie lateral, y el volumen cuando corresponde.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el área de un triángulo con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona "Triángulo" e introduce la base y la altura perpendicular. La calculadora aplica la fórmula A = (base × altura) / 2 y muestra el resultado con la fórmula visible. Con el área basta, pero para el perímetro hace falta un dato más: con solo la base y la altura hay infinitos triángulos posibles, así que la calculadora da el del isósceles —el más corto— y lo advierte. Si escribes además uno de los lados, calcula el tercero y el perímetro pasa a ser exacto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil esta calculadora de geometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es adecuada para estudiantes de primaria y secundaria que trabajan con figuras básicas, y también para bachillerato cuando se calculan volúmenes de sólidos o polígonos regulares. Las fórmulas se muestran paso a paso, lo que facilita el aprendizaje y la comprobación de ejercicios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el volumen de una esfera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona "Esfera" en la sección de figuras 3D e introduce el radio. La herramienta aplica la fórmula V = (4/3) × π × r³ y calcula también el área de la superficie (4πr²). El número π se usa con precisión completa, por lo que el resultado es exacto al número de decimales que se muestre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre área y volumen en geometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El área mide la superficie de una figura, es decir, el espacio bidimensional que ocupa, y se expresa en unidades al cuadrado (cm², m²). El volumen mide el espacio tridimensional que ocupa un sólido y se expresa en unidades al cubo (cm³, m³). La calculadora distingue ambos conceptos y calcula cada uno con su fórmula específica.',
      },
    },
  ],
};
