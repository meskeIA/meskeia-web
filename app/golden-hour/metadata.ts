import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Golden Hour - Calculadora de Luz Dorada y Hora Azul | meskeIA',
  description: 'Calcula las horas de luz dorada y hora azul para fotografía. Amanecer, atardecer, crepúsculos y posición del sol según tu ubicación y fecha.',
  keywords: 'golden hour, hora dorada, hora azul, blue hour, fotografia, amanecer, atardecer, crepusculo, luz natural, posicion sol, planificar fotos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Golden Hour - Calculadora de Luz Dorada',
    description: 'Planifica tus sesiones de fotos con la mejor luz natural. Calcula golden hour y blue hour.',
    url: 'https://meskeia.com/golden-hour/',
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
    title: 'Golden Hour - meskeIA',
    description: 'Calcula las horas de luz perfecta para fotografía según tu ubicación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Golden Hour meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Golden Hour - Calculadora de Luz Dorada y Hora Azul',
  description: 'Calcula las horas de luz dorada y hora azul para fotografía. Amanecer, atardecer, crepúsculos y posición del sol según tu ubicación y fecha.',
  url: 'https://meskeia.com/golden-hour/',
  category: 'UtilityApplication',
  features: [
    'Cálculo de golden hour y blue hour por ubicación y fecha',
    'Horas de amanecer, atardecer y crepúsculo civil, náutico y astronómico',
    'Posición del sol: azimut y elevación en tiempo real',
    'Gratuito, en español, sin registro',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la golden hour en fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La golden hour (hora dorada) es el período justo después del amanecer y justo antes del atardecer, cuando el sol está bajo en el horizonte. La luz es más cálida (tonos naranjas y dorados), tiene menor intensidad y crea sombras largas y suaves. Es el momento favorito de los fotógrafos porque reduce el contraste duro y añade profundidad y calidez a retratos, paisajes y arquitectura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dura la golden hour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La duración varía según la estación y la latitud. En verano en latitudes medias (España, México) puede durar 20-40 minutos. En invierno, cuando el sol sube más despacio, puede extenderse hasta 60-90 minutos. Cerca del ecuador la luz cambia muy rápido y la golden hour puede durar solo 10-15 minutos. En latitudes altas (Escandinavia en verano) puede prolongarse horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la blue hour y cómo se diferencia de la golden hour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La blue hour (hora azul) ocurre cuando el sol está entre 4° y 6° por debajo del horizonte, antes del amanecer y después del atardecer. La luz es fría, de tonos azulados y morados, uniforme y sin sombras. Es ideal para fotografía urbana nocturna porque hay suficiente luz ambiental para equilibrar las luces artificiales de edificios y farolas. Dura aproximadamente 20-40 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mejor horario para hacer fotos al aire libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La golden hour de amanecer y atardecer ofrece la mejor luz natural para la mayoría de géneros fotográficos. El mediodía (luz cenital dura) es el peor momento salvo para fotografía de agua o cuando se buscan sombras geométricas. La blue hour es ideal para cityscape nocturno. Los días nublados crean una luz difusa natural excelente para retratos sin las limitaciones horarias de la luz solar directa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calcular la golden hour para mi ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La golden hour ocurre en los 30-60 minutos posteriores al amanecer y los 30-60 minutos anteriores al atardecer. Para calcularla exactamente necesitas la hora de salida y puesta del sol en tu ubicación y fecha, que varía cada día. Herramientas como la calculadora golden hour de meskeIA calculan automáticamente estas horas usando las coordenadas de tu ciudad y la fecha seleccionada.',
      },
    },
  ],
};
