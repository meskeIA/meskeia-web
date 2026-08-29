import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Huella de lo que Comes - Impacto Ambiental por Alimento | meskeIA',
  description: 'Compara la huella de carbono, consumo de agua y uso de suelo de alimentos comunes. Barras comparativas interactivas con datos científicos.',
  keywords: 'huella carbono alimentos, impacto ambiental comida, CO2 alimentación, consumo agua alimentos, uso suelo, sostenibilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Huella de lo que Comes',
    description: 'Compara el impacto ambiental de los alimentos: CO2, agua y uso de suelo.',
    url: 'https://meskeia.com/visualizador-huella-alimentos/',
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
    title: 'La Huella de lo que Comes',
    description: 'El impacto ambiental de tu plato: CO2, agua y suelo por alimento.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: { 'application-name': 'Huella Alimentos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Huella de lo que Comes',
  description: 'Explicador visual del impacto ambiental de alimentos comunes. Compara huella de carbono (kg CO2), consumo de agua (litros) y uso de suelo (m²) por kg de alimento.',
  url: 'https://meskeia.com/visualizador-huella-alimentos/',
  features: [
    'Comparativa de 15+ alimentos por impacto ambiental',
    '3 métricas: CO2, agua y uso de suelo',
    'Barras proporcionales con ordenación interactiva',
    'Datos de Our World in Data / Poore & Nemecek 2018',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la huella de carbono de los alimentos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La huella de carbono de un alimento mide los kilogramos de CO₂ equivalente emitidos durante toda su cadena de producción: cultivo, ganadería, transporte y procesado. Producir 1 kg de carne de vacuno genera en torno a 60 kg de CO₂eq, mientras que 1 kg de legumbres emite menos de 1 kg. Conocer esta cifra ayuda a tomar decisiones alimentarias más conscientes del impacto climático.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua se necesita para producir un kilo de carne?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Producir 1 kg de carne de vacuno requiere aproximadamente 15.000 litros de agua, según datos del Instituto de Agua de la UNESCO. La mayor parte corresponde al agua que consume el forraje y los pastos a lo largo de la vida del animal. En comparación, producir 1 kg de trigo necesita unos 1.500 litros y 1 kg de tomates alrededor de 200 litros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué alimentos tienen menor impacto ambiental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las legumbres (lentejas, garbanzos), los cereales integrales, las verduras y las frutas de temporada presentan las huellas de carbono, hídrica y de uso de suelo más bajas. Los productos de origen animal —especialmente la carne roja y los lácteos— encabezan el impacto en las tres métricas. Sustituir solo una comida de carne a la semana por legumbres puede reducir la huella anual de una persona en varios cientos de kg de CO₂.',
      },
    },
    {
      '@type': 'Question',
      name: '¿De dónde proceden los datos sobre impacto ambiental de alimentos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los datos de este visualizador provienen del estudio de Poore & Nemecek (2018) publicado en la revista Science, que analizó más de 38.000 granjas en 119 países, y de Our World in Data, que los sistematiza y actualiza periódicamente. Es la referencia científica más completa sobre ciclo de vida alimentario disponible hasta la fecha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo reducir mi huella ambiental alimentaria sin dejar de comer bien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las acciones con mayor impacto son: reducir la frecuencia de consumo de carne roja y lácteos, priorizar productos de temporada y proximidad, y disminuir el desperdicio alimentario (que representa un 8-10% de las emisiones globales). No es necesario seguir una dieta vegana estricta; una dieta mediterránea rica en vegetales, legumbres y pescado azul ya supone una reducción sustancial frente a la dieta occidental promedio.',
      },
    },
  ],
};
