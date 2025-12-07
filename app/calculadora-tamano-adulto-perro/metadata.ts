import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Tamaño Adulto para Cachorros | meskeIA',
  description: 'Predice el peso adulto de tu cachorro según su edad, peso actual y tamaño de raza. Curvas de crecimiento y tabla de razas de referencia.',
  keywords: 'peso adulto cachorro, tamaño perro adulto, crecimiento cachorro, predicción peso perro, raza perro, cuánto pesará mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Tamaño Adulto para Cachorros',
    description: 'Predice cuánto pesará tu cachorro cuando sea adulto',
    url: 'https://meskeia.com/calculadora-tamano-adulto-perro',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Predictor de Tamaño Adulto para Cachorros',
    description: 'Calcula el peso final de tu cachorro según su raza y peso actual',
  },
};
