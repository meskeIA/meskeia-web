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
    'Posición del sol en este momento: altura y azimut',
    'Horas en el huso del lugar, también al planificar un viaje',
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
        text: 'Depende sobre todo de la latitud. Contada desde la salida del sol hasta que alcanza 6° de altura, cerca del ecuador dura unos 27-30 minutos todo el año, porque el sol sube casi en vertical; en latitudes medias (Madrid, Buenos Aires) dura entre 33 y 44 minutos, algo menos en los equinoccios y algo más en los solsticios. En latitudes altas se alarga mucho: en Oslo pasa de una hora, y por encima del círculo polar puede durar toda la noche en verano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la blue hour y cómo se diferencia de la golden hour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La blue hour (hora azul) es el crepúsculo civil: el tramo en que el sol está entre el horizonte y 6° por debajo de él, antes del amanecer y después del atardecer (algunas apps de fotografía la reducen a la franja entre 4° y 6° bajo el horizonte). La luz es fría, de tonos azulados, uniforme y sin sombras, e ideal para fotografía urbana porque equilibra el cielo con las luces artificiales. Con esa definición dura unos 20-25 minutos cerca del ecuador y 25-35 minutos en latitudes medias, y bastante más cerca de los polos.',
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
        text: 'La golden hour va desde la salida del sol hasta que alcanza 6° de altura, y desde que baja de 6° hasta la puesta: entre 25 y 45 minutos en latitudes bajas y medias. Para calcularla exactamente necesitas las coordenadas del lugar y la fecha, porque cambia cada día, y leer las horas en el huso horario del lugar, no en el de tu móvil si estás planificando un viaje. Una calculadora solar hace el cálculo a partir de la ciudad y la fecha elegidas.',
      },
    },
  ],
};
