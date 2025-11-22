import type { Metadata } from 'next';
import { generateCalculatorSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Propinas - Calcula la propina perfecta | meskeIA',
  description:
    '¿Cuánto dejar de propina en un restaurante? Calculadora automática con diferentes porcentajes (5%, 10%, 15%). Divide la cuenta entre personas fácilmente.',
  keywords: [
    'calculadora propinas',
    'calcular propina',
    'porcentaje propina',
    'propina camarero',
    'tip calculator',
    'propinas español',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Propinas - meskeIA',
    description:
      'Calcula propinas automáticamente con diferentes porcentajes. Gratis, sin registro, 100% offline.',
    url: 'https://meskeia.com/calculadora-propinas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Propinas - meskeIA',
    description: 'Calcula propinas automáticamente. Sin publicidad, funciona offline.',
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-propinas/',
  },
};

// Schema.org JSON-LD con template reutilizable
export const jsonLd = generateCalculatorSchema({
  name: 'Calculadora de Propinas',
  description:
    'Calculadora online gratuita para calcular propinas automáticamente con diferentes porcentajes. Divide la cuenta entre personas, selecciona país/contexto y guarda preferencias.',
  url: 'https://meskeia.com/calculadora-propinas/',
  calculationType: 'Propinas',
  features: [
    'Cálculo automático de propinas con múltiples porcentajes',
    'Porcentajes predefinidos por país (España, USA, México, UK, Francia, Alemania, Japón)',
    'División de cuenta entre múltiples personas',
    'Porcentaje personalizado configurable',
    'Guarda preferencias en el navegador',
    'Funciona 100% offline (PWA)',
    'Sin registros, sin publicidad, totalmente gratis',
    'Formato español (números con coma decimal)',
    'Responsive y optimizado para móviles',
  ],
});
