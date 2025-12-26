import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Macronutrientes - Proteínas, Carbohidratos y Grasas | meskeIA',
  description: 'Calcula tus macros diarios según tu objetivo: volumen, definición o mantenimiento. Proteínas, carbohidratos y grasas personalizados para tu peso y actividad.',
  keywords: 'calculadora macros, macronutrientes, proteínas, carbohidratos, grasas, dieta, nutrición, volumen, definición, fitness, culturismo, musculación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Macronutrientes - Proteínas, Carbohidratos y Grasas',
    description: 'Calcula tus macros diarios según tu objetivo: volumen, definición o mantenimiento.',
    url: 'https://meskeia.com/calculadora-macros',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Macronutrientes',
    description: 'Calcula proteínas, carbohidratos y grasas según tu objetivo fitness.',
  },
  other: {
    'application-name': 'Calculadora de Macros meskeIA',
  },
};
