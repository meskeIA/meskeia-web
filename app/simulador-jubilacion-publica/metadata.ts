import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Jubilación Pública 2026 — Edad, pensión y anticipada | meskeIA',
  description: 'Simula tu jubilación pública completa: edad de jubilación, pensión estimada (sistema dual 2026), jubilación anticipada con coeficientes reductores y jubilación parcial. Todo en una sola herramienta.',
  keywords: 'simulador jubilacion, edad jubilacion 2026, pension publica, jubilacion anticipada, jubilacion parcial, seguridad social pension, sistema dual 2026, coeficientes reductores, cuando me jubilo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Jubilación Pública 2026 | meskeIA',
    description: 'Edad de jubilación, pensión estimada, anticipada y parcial. Todo en una herramienta.',
    url: 'https://meskeia.com/simulador-jubilacion-publica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Jubilación Pública 2026 | meskeIA',
    description: 'Simula tu jubilación completa: edad, pensión, anticipada y parcial.',
  },
  other: {
    'application-name': 'Simulador Jubilación Pública meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Jubilación Pública',
  description: 'Simulador completo de jubilación pública española: calcula tu edad de jubilación según año de nacimiento y cotización, estima tu pensión con el sistema dual 2026, analiza la jubilación anticipada (voluntaria e involuntaria) con coeficientes reductores, y orienta sobre la jubilación parcial.',
  url: 'https://meskeia.com/simulador-jubilacion-publica/',
  features: [
    'Edad de jubilación personalizada por año de nacimiento',
    'Estimación de pensión con sistema dual 2026',
    'Análisis de jubilación anticipada (voluntaria e involuntaria)',
    'Orientación sobre jubilación parcial con contrato de relevo',
    'Tabla progresiva de edad de jubilación 2024-2027',
    'Comparativa fórmula clásica vs ampliada (sistema dual)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
