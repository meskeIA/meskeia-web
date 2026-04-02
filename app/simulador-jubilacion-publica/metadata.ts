import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Jubilaci\u00f3n P\u00fablica 2026 \u2014 Edad, pensi\u00f3n y anticipada | meskeIA',
  description: 'Simula tu jubilaci\u00f3n p\u00fablica completa: edad de jubilaci\u00f3n, pensi\u00f3n estimada (sistema dual 2026), jubilaci\u00f3n anticipada con coeficientes reductores y jubilaci\u00f3n parcial. Todo en una sola herramienta.',
  keywords: 'simulador jubilacion, edad jubilacion 2026, pension publica, jubilacion anticipada, jubilacion parcial, seguridad social pension, sistema dual 2026, coeficientes reductores, cuando me jubilo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Jubilaci\u00f3n P\u00fablica 2026 | meskeIA',
    description: 'Edad de jubilaci\u00f3n, pensi\u00f3n estimada, anticipada y parcial. Todo en una herramienta.',
    url: 'https://meskeia.com/simulador-jubilacion-publica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Jubilaci\u00f3n P\u00fablica 2026 | meskeIA',
    description: 'Simula tu jubilaci\u00f3n completa: edad, pensi\u00f3n, anticipada y parcial.',
  },
  other: {
    'application-name': 'Simulador Jubilaci\u00f3n P\u00fablica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Jubilaci\u00f3n P\u00fablica',
  description: 'Simulador completo de jubilaci\u00f3n p\u00fablica espa\u00f1ola: calcula tu edad de jubilaci\u00f3n seg\u00fan a\u00f1o de nacimiento y cotizaci\u00f3n, estima tu pensi\u00f3n con el sistema dual 2026, analiza la jubilaci\u00f3n anticipada (voluntaria e involuntaria) con coeficientes reductores, y orienta sobre la jubilaci\u00f3n parcial.',
  url: 'https://meskeia.com/simulador-jubilacion-publica/',
  features: [
    'Edad de jubilaci\u00f3n personalizada por a\u00f1o de nacimiento',
    'Estimaci\u00f3n de pensi\u00f3n con sistema dual 2026',
    'An\u00e1lisis de jubilaci\u00f3n anticipada (voluntaria e involuntaria)',
    'Orientaci\u00f3n sobre jubilaci\u00f3n parcial con contrato de relevo',
    'Tabla progresiva de edad de jubilaci\u00f3n 2024-2027',
    'Comparativa f\u00f3rmula cl\u00e1sica vs ampliada (sistema dual)',
    'Funciona 100% en el navegador, sin registro ni instalaci\u00f3n',
    'Gratuito y sin publicidad',
  ],
});
