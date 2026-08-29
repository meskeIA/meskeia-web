import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Aditivos E Alimentarios - Qué son y para qué sirven | meskeIA',
  description: 'Consulta los 90 aditivos E más comunes en los alimentos: código, nombre, categoría, origen y función. Busca por nombre o filtra por tipo. Información oficial EFSA.',
  keywords: 'aditivos alimentarios, códigos E, conservantes, colorantes, emulsionantes, antioxidantes, etiquetas alimentos, EFSA, aditivos E números',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Aditivos E Alimentarios | meskeIA',
    description: 'Busca y consulta los aditivos E más comunes: qué son, de dónde vienen y en qué alimentos los encontrarás.',
    url: 'https://meskeia.com/aditivos-e-alimentarios/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Aditivos E Alimentarios | meskeIA',
    description: 'Consulta los 90 aditivos E más comunes: código, categoría, origen y función. Buscador y filtros.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: {
    'application-name': 'Guía Aditivos E meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Aditivos E Alimentarios',
  description: 'Base de datos consultable de los 90 aditivos E alimentarios más comunes. Incluye código E, nombre científico, categoría, origen (natural/sintético/semisintético), función tecnológica en el alimento y ejemplos de productos donde aparecen.',
  url: 'https://meskeia.com/aditivos-e-alimentarios/',
  features: [
    'Búsqueda por código E o nombre del aditivo',
    'Filtro por categoría (colorante, conservante, antioxidante, emulsionante...)',
    '90 aditivos E con información oficial EFSA',
    'Origen de cada aditivo: natural, sintético o semisintético',
    'Ejemplos de alimentos donde aparece cada aditivo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los aditivos alimentarios con código E?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los aditivos con código E son sustancias autorizadas por la Unión Europea para su uso en alimentos con una función tecnológica concreta: conservar, colorear, estabilizar, emulsionar o potenciar el sabor, entre otras. La "E" indica que han sido evaluados por la Autoridad Europea de Seguridad Alimentaria (EFSA) y considerados seguros a las dosis permitidas. El número que acompaña a la letra identifica el tipo y la sustancia específica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales categorías de aditivos E?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los aditivos E se agrupan en función de su papel tecnológico. Las categorías más comunes son: colorantes (E100-E199), conservantes (E200-E299), antioxidantes (E300-E399), estabilizantes y emulsionantes (E400-E499), potenciadores del sabor (E600-E699) y edulcorantes (E900-E999). Dentro de cada rango hay sustancias de origen natural, sintético y semisintético.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Todos los aditivos E son artificiales o los hay naturales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aproximadamente un tercio de los aditivos E autorizados tiene origen natural. Por ejemplo, la curcumina (E100) procede de la cúrcuma, el ácido ascórbico (E300) es vitamina C y la lecitina de soja (E322) es un emulsionante natural. El código E no indica artificialidad; indica que la sustancia ha pasado el proceso de evaluación y autorización de la EFSA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo identificar los aditivos en el etiquetado de un producto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la lista de ingredientes pueden aparecer por su código (E330), por su nombre completo (ácido cítrico) o por ambos. Cuando se declara la categoría funcional seguida del código o nombre, por ejemplo "antioxidante (E330)", es más fácil identificar su función. Buscar el código en una guía especializada permite conocer su origen, para qué se usa y en qué alimentos es más frecuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Son seguros los aditivos E para consumir a diario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La EFSA establece para cada aditivo una Ingesta Diaria Admisible (IDA), que es la cantidad que puede consumirse a lo largo de la vida sin riesgo apreciable para la salud. Las dosis autorizadas en los alimentos están fijadas muy por debajo de ese umbral. No obstante, algunas personas presentan sensibilidades individuales a ciertos aditivos, por lo que ante dudas concretas conviene consultar a un profesional de la salud o la nutrición.',
      },
    },
  ],
};
