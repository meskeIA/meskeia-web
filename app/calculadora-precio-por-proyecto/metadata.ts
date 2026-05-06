import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
  description: 'Calcula cuánto cobrar por un proyecto freelance completo. Horas estimadas, complejidad, imprevistos, gastos y margen de negociación.',
  keywords: 'precio proyecto freelance, presupuesto freelance, cobrar proyecto, tarifa proyecto, calcular precio, autónomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
    description: 'Estima cuánto cobrar por un proyecto freelance completo con desglose, imprevistos y rango de negociación.',
    url: 'https://meskeia.com/calculadora-precio-por-proyecto/',
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
    title: 'Calculadora de Precio por Proyecto Freelance | meskeIA',
    description: 'Calcula el precio justo de tu próximo proyecto freelance. Desglose completo y rango de negociación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Precio por Proyecto meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Precio por Proyecto Freelance',
  description: 'Herramienta gratuita para estimar el precio de un proyecto freelance completo. Calcula horas, complejidad, urgencia, imprevistos y gastos para obtener un rango de negociación profesional.',
  url: 'https://meskeia.com/calculadora-precio-por-proyecto/',
  features: [
    'Cálculo de precio por proyecto con desglose detallado',
    'Rango de negociación: precio mínimo, recomendado e ideal',
    'Multiplicadores de complejidad y urgencia',
    'Margen de imprevistos configurable',
    'Métricas útiles: tarifa efectiva, duración estimada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
