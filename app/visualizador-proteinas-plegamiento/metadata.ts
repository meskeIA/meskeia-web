import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Plegamiento de Proteínas: Estructura y Enfermedades — meskeIA',
  description: 'Visualizador del plegamiento proteínico. 4 niveles de estructura (1°/2°/3°/4°), funnel energético, 6 tipos funcionales y enfermedades de mal plegamiento: Alzheimer, Parkinson, priones, fibrosis quística.',
  keywords: ['plegamiento proteínas', 'estructura proteína primaria secundaria terciaria', 'funnel energético proteína', 'enfermedades priones', 'Alzheimer beta-amiloide', 'alfa-sinucleína Parkinson', 'chaperonas moleculares HSP70', 'fibrosis quística CFTR'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Plegamiento de Proteínas: Estructura y Enfermedades — meskeIA',
    description: '4 niveles de estructura, funnel de plegamiento y enfermedades por mal plegamiento.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-proteinas-plegamiento',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plegamiento de Proteínas: Estructura y Enfermedades',
    description: 'Del gen a la estructura 3D: 4 niveles, funnel energético y enfermedades de mal plegamiento.',
  },
  other: { 'application-name': 'Plegamiento de Proteínas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Plegamiento de Proteínas: Estructura y Enfermedades',
  description: 'Visualizador interactivo del plegamiento proteínico. Estructura primaria, secundaria, terciaria y cuaternaria. Funnel energético de plegamiento. 6 tipos funcionales de proteínas. Enfermedades de mal plegamiento: Alzheimer, Parkinson, priones y fibrosis quística.',
  url: 'https://meskeia.com/visualizador-proteinas-plegamiento/',
  category: 'EducationalApplication',
  features: [
    'Los 4 niveles de estructura proteínica con SVG interactivo',
    'Funnel energético del plegamiento (paradoja de Levinthal)',
    '6 tipos funcionales de proteínas con ejemplos reales',
    'Enfermedades por mal plegamiento: Alzheimer, Parkinson, priones, fibrosis quística',
    'Chaperonas moleculares y proteínas de shock térmico',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Disponible en español',
  ],
});
