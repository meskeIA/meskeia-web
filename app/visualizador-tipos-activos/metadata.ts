import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las 6 Clases de Activos: Rentabilidad, Riesgo y Correlación | meskeIA',
  description:
    'Visualizador educativo de las 6 clases de activos: acciones, bonos, inmobiliario, materias primas, criptomonedas y efectivo. Compara rentabilidad histórica, volatilidad, correlación y carteras tipo.',
  keywords: [
    'clases de activos',
    'renta variable fija',
    'diversificación cartera',
    'correlación activos',
    'acciones bonos inmobiliario',
    'educación financiera',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las 6 Clases de Activos — Visualizador Educativo | meskeIA',
    description:
      'Acciones, bonos, inmobiliario, materias primas, cripto y efectivo: rentabilidad histórica, volatilidad, correlación y carteras tipo.',
    url: 'https://meskeia.com/visualizador-tipos-activos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Las 6 Clases de Activos — Visualizador Educativo | meskeIA',
    description:
      'Acciones, bonos, inmobiliario, materias primas, cripto y efectivo: rentabilidad histórica, volatilidad, correlación y carteras tipo.',
  },
  other: {
    'application-name': 'Visualizador Tipos de Activos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Clases de Activos',
  description:
    'Visualizador educativo interactivo de las 6 clases de activos principales: acciones, bonos, inmobiliario, materias primas, criptomonedas y efectivo. Incluye comparativa de rentabilidad histórica y volatilidad, matriz de correlación entre clases y ejemplos de carteras tipo por perfil de riesgo.',
  url: 'https://meskeia.com/visualizador-tipos-activos/',
  category: 'FinanceApplication',
  features: [
    'Comparativa de 6 clases de activos: rentabilidad, volatilidad y horizonte',
    'Detalle completo de cada clase con ventajas, riesgos y ejemplos',
    'Matriz de correlación entre clases para entender la diversificación',
    '4 carteras tipo (defensiva, equilibrada, crecimiento, especulativa)',
    'Guía educativa sobre diversificación y gestión de riesgo',
  ],
});
