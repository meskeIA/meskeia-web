import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Telomerasa - La Enzima del Envejecimiento y la Inmortalidad Celular | meskeIA',
  description: 'Cómo funciona la telomerasa: alarga los telómeros usando su propio ARN como molde, el límite de Hayflick, por qué las células cancerosas son "inmortales" y el Premio Nobel 2009.',
  keywords: [
    'telomerasa como funciona',
    'telomeros envejecimiento',
    'limite Hayflick',
    'telomerasa cancer',
    'Nobel telomerasa 2009',
    'telomeros celulas',
    'envejecimiento celular telomeros',
    'TTAGGG secuencia',
    'inmortalidad celular',
  ],
  openGraph: {
    title: 'Telomerasa - Envejecimiento e Inmortalidad Celular | meskeIA',
    description: 'La enzima que alarga los telómeros y su papel en el envejecimiento y el cáncer.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Telomerasa - La Enzima de la Inmortalidad Celular",
  description: "Cómo funciona la telomerasa: alarga los telómeros usando su propio ARN como molde, el límite de Hayflick, por qué las células cancerosas son \"inmortales\" y el Premio Nobel 2009.",
  url: "https://meskeia.com/visualizador-telomerasa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la telomerasa y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La telomerasa es una enzima que alarga los telómeros, las secuencias repetidas (TTAGGG) que protegen los extremos de los cromosomas. Usa su propio ARN como molde para añadir nuevas repeticiones, evitando que los cromosomas se acorten con cada división celular. Sin telomerasa activa, las células normales envejecen y dejan de dividirse tras un número limitado de ciclos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el límite de Hayflick?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El límite de Hayflick es el número máximo de veces que una célula somática humana puede dividirse antes de entrar en senescencia, aproximadamente entre 40 y 60 divisiones. Fue descrito por Leonard Hayflick en 1961. Cada división acorta ligeramente los telómeros; cuando alcanzan una longitud crítica, la célula detiene su proliferación como mecanismo de protección frente a la inestabilidad genómica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las células cancerosas son "inmortales"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En más del 85 % de los tumores, la telomerasa se reactiva de forma anormal, permitiendo que las células cancerosas regeneren sus telómeros indefinidamente y se dividan sin límite. Esta capacidad de eludir el límite de Hayflick es uno de los sellos distintivos del cáncer. Por eso la telomerasa es un objetivo terapéutico activo: inhibirla acortaría los telómeros y detendría la proliferación tumoral.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A quiénes se les concedió el Nobel de Medicina de 2009 por la telomerasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Premio Nobel de Fisiología o Medicina de 2009 fue concedido a Elizabeth Blackburn, Carol Greider y Jack Szostak por el descubrimiento de cómo los cromosomas están protegidos por los telómeros y por la telomerasa. Blackburn y Greider identificaron la telomerasa en 1984 trabajando con el microorganismo Tetrahymena, un modelo clave para el estudio de la biología de los telómeros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Alargar los telómeros previene el envejecimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque los telómeros más cortos se asocian con mayor riesgo de enfermedades relacionadas con la edad, activar artificialmente la telomerasa en células sanas también aumenta el riesgo oncogénico. Los estudios con ratones muestran que una sobreexpresión controlada puede prolongar la vida saludable, pero en humanos no existe ninguna terapia aprobada. Los suplementos comerciales que prometen "alargar telómeros" carecen de evidencia clínica sólida.',
      },
    },
  ],
};
