import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Infusiones - Usos tradicionales y preparación | meskeIA',
  description: 'Directorio de 55 plantas para infusión: usos tradicionales, temperatura, tiempo de infusión, contraindicaciones y combinaciones. Filtros por familia (digestiva, relajante, estimulante...).',
  keywords: 'infusiones plantas medicinales, manzanilla, tila, jengibre, cúrcuma, valeriana, hibisco, usos tradicionales plantas, cómo preparar infusiones, fitoterapia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Infusiones | meskeIA',
    description: 'Consulta los usos tradicionales, preparación y contraindicaciones de 55 plantas para infusión. Filtros por familia.',
    url: 'https://meskeia.com/guia-infusiones/',
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
    title: 'Guía de Infusiones | meskeIA',
    description: 'Directorio de 55 infusiones: usos tradicionales, preparación y contraindicaciones. Filtros por familia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Infusiones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Infusiones',
  description: 'Directorio consultable de 55 plantas para infusión con usos tradicionales populares, instrucciones de preparación (temperatura, tiempo, cantidad), contraindicaciones conocidas y plantas con las que combinan. Filtros por 8 familias: digestiva, relajante, estimulante, depurativa, respiratoria, antiinflamatoria, antioxidante y adaptógena.',
  url: 'https://meskeia.com/guia-infusiones/',
  features: [
    'Búsqueda por nombre o uso tradicional',
    'Filtros por 8 familias de infusiones',
    '55 plantas con perfil completo',
    'Instrucciones de preparación (temperatura, tiempo, cantidad)',
    'Contraindicaciones conocidas por planta',
    'Con qué otras infusiones combina',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una infusión, una decocción y un macerado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una infusión se prepara vertiendo agua caliente (70-95 °C) sobre la planta y dejando reposar 3-10 minutos; es el método más habitual para flores y hojas delicadas. Una decocción consiste en hervir la planta en agua durante 10-20 minutos y es más adecuada para raíces, cortezas y semillas duras que necesitan más tiempo para liberar sus compuestos. Un macerado es la extracción en frío durante horas o días sin aplicar calor, conservando mejor ciertos principios activos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura y durante cuánto tiempo se prepara la tila o la manzanilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La manzanilla se prepara con agua a 90-95 °C y un tiempo de infusión de 5-7 minutos; temperaturas más altas pueden amargar el resultado. La tila (tilo) funciona bien entre 85-90 °C durante 8-10 minutos. En general, las flores y partes delicadas se benefician de temperaturas algo más bajas que las hojas más robustas, que toleran hasta 95 °C sin deteriorarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué infusiones tienen contraindicaciones importantes que debo conocer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunas plantas populares tienen contraindicaciones relevantes: la valeriana puede potenciar sedantes y no se recomienda en embarazo ni en menores; el regaliz en dosis elevadas puede elevar la presión arterial; el ginkgo biloba puede interactuar con anticoagulantes; y el hipérico (hierba de San Juan) reduce la eficacia de anticonceptivos hormonales y otros medicamentos. Ante tratamientos farmacológicos o embarazo, consultar siempre con un profesional sanitario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la infusión de jengibre y cómo se prepara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El jengibre tiene un uso tradicional ampliamente documentado como digestivo y antiemético. Se prepara rallando o cortando 1-2 cm de raíz fresca en agua a 90-95 °C durante 8-10 minutos; con raíz seca basta 5-7 minutos. Su componente activo, el gingerol, es responsable del sabor picante y de buena parte de sus propiedades. Combina bien con limón, cúrcuma y miel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre infusiones relajantes y adaptógenas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las infusiones relajantes (tila, valeriana, pasiflora, melisa) actúan principalmente sobre el sistema nervioso reduciendo la activación y facilitando el sueño, y su efecto se produce en horas. Las adaptógenas (ashwagandha, rhodiola, astragalus) son plantas que, según la fitoterapia tradicional, ayudan al organismo a modular la respuesta al estrés a lo largo del tiempo con un uso continuado de semanas o meses. No inducen sedación inmediata sino una regulación progresiva.',
      },
    },
  ],
};
