import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Áreas, Perímetros y Volúmenes — Todas las Fórmulas | meskeIA',
  description:
    'Formulario de geometría con buscador: área, perímetro y volumen de 48 figuras planas y cuerpos geométricos, con diagrama de cada figura, las letras explicadas y un ejemplo numérico resuelto.',
  keywords:
    'tabla de areas y volumenes, formulas de geometria, area y perimetro, formulario de geometria, volumen del cilindro, area de la esfera, area del trapecio, formula de Heron, volumen del cono, tronco de cono, poligono regular, cuerpos geometricos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-areas-volumenes/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Áreas, Perímetros y Volúmenes con Buscador | meskeIA',
    description:
      'Escribe «trapecio», «cono» o «esfera» y aparece la fórmula con un diagrama que explica qué es cada letra y un ejemplo numérico resuelto.',
    url: 'https://meskeia.com/tabla-areas-volumenes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Áreas, Perímetros y Volúmenes con Buscador | meskeIA',
    description:
      'Formulario de geometría con diagrama por figura, letras explicadas y ejemplo resuelto en cada fórmula.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Áreas y Volúmenes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Áreas, Perímetros y Volúmenes',
  description:
    'Formulario de geometría de consulta rápida con 48 figuras: polígonos, círculo y figuras curvas, cuerpos poliédricos, cuerpos de revolución y figuras compuestas. Cada figura incluye un diagrama con las dimensiones etiquetadas, las fórmulas de perímetro, área (lateral y total) y volumen, un ejemplo numérico resuelto y una nota sobre dónde se usa en la vida real.',
  url: 'https://meskeia.com/tabla-areas-volumenes/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo tolerante a acentos y con sinónimos regionales',
    '48 figuras planas y cuerpos geométricos en cinco categorías filtrables',
    'Diagrama de cada figura con las dimensiones etiquetadas (b, h, r, g, a)',
    'Perímetro, área lateral, área total, volumen y diagonal cuando procede',
    'Ejemplo numérico resuelto con valores concretos en cada figura',
    'Nota de uso real: parcelas, depósitos, pintura, cubiertas y envases',
    'Figuras compuestas: silos, piscinas, parcelas en L y depósitos con fondos esféricos',
    'Funciona en el navegador, sin registro ni instalación, y es gratuito',
  ],
  keywords: ['tabla de áreas y volúmenes', 'fórmulas de geometría', 'perímetro', 'volumen'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la fórmula del área del trapecio y qué significa la «h»?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El área de un trapecio es A = (B + b) / 2 × h, donde B y b son las dos bases paralelas y h es la altura, es decir, la distancia perpendicular entre esas dos bases. La h no es el lado inclinado: ese error infla el resultado. Por ejemplo, con B = 8 cm, b = 5 cm y h = 4 cm el área es (8 + 5) / 2 × 4 = 26 cm².',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula cuántos litros caben en un depósito cilíndrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de un cilindro es V = π × r² × h, con r el radio de la base y h la altura. Si trabajas en metros el resultado sale en metros cúbicos, y cada metro cúbico equivale a 1.000 litros. Un depósito de 0,5 m de radio y 1,2 m de altura contiene π × 0,25 × 1,2 = 0,9425 m³, es decir, unos 942 litros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre área lateral y área total en un cono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El área lateral es solo la superficie curva y vale π × r × g, donde g es la generatriz (el lado inclinado), no la altura. El área total añade el círculo de la base: A = π × r × (r + g). La generatriz se obtiene con Pitágoras, g = √(r² + h²): en un cono de r = 3 m y h = 4 m resulta g = 5 m.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la superficie de un terreno con forma irregular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se descompone en figuras simples: rectángulos, triángulos y sectores de círculo, se calcula el área de cada parte y se suman; los huecos se restan. Una parcela en forma de L se resuelve como un rectángulo grande menos la esquina que falta. Si solo conoces los tres lados de un triángulo, la fórmula de Herón da el área sin necesidad de medir la altura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fórmulas del área y el volumen de la esfera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La superficie de una esfera es A = 4 × π × r² y su volumen es V = (4/3) × π × r³. Con un radio de 6 cm la superficie es 452,39 cm² y el volumen 904,78 cm³. Conviene fijarse en los exponentes: el área lleva r al cuadrado y el volumen al cubo, así que duplicar el radio multiplica la superficie por 4 y el volumen por 8.',
      },
    },
  ],
};
