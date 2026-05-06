import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mapa de tu Dinero Mensual - ¿Adónde va tu sueldo? | meskeIA',
  description: 'Visualiza cómo se reparte el sueldo medio español: vivienda, alimentación, transporte, ocio, seguros y ahorro. Bloques interactivos con slider de sueldo.',
  keywords: 'reparto sueldo mensual, gastos mensuales, presupuesto personal, vivienda transporte alimentación, finanzas personales, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mapa de tu Dinero Mensual',
    description: '¿Adónde va tu sueldo? Visualiza el reparto mensual medio en España.',
    url: 'https://meskeia.com/visualizador-mapa-dinero-mensual',
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
    title: 'El Mapa de tu Dinero Mensual',
    description: 'Vivienda, comida, transporte... ¿adónde va tu sueldo cada mes?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa Dinero Mensual meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mapa de tu Dinero Mensual',
  description: 'Explicador visual del reparto mensual del sueldo en España: vivienda, alimentación, transporte, suministros, ocio, seguros, ropa y ahorro. Slider de sueldo personalizable.',
  url: 'https://meskeia.com/visualizador-mapa-dinero-mensual/',
  features: [
    'Reparto del sueldo en 10 categorías de gasto',
    'Slider de sueldo neto personalizable',
    'Bloques clickables con explicación y dato INE',
    'Barra de reparto proporcional visual',
    'Gráfico doughnut de composición',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
