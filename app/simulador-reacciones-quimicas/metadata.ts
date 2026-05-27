import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Reacciones Químicas | meskeIA',
  description: 'Calculadora de estequiometría y reactivo limitante para 20 reacciones químicas reales. Dado X gramos o moles de una sustancia, calcula todos los demás. Encuentra el reactivo que agota primero y el rendimiento teórico.',
  keywords: [
    'estequiometría química',
    'reactivo limitante',
    'cálculo moles gramos',
    'reacciones químicas calculadora',
    'rendimiento teórico reacción',
    'masa molar cálculo',
    'química bachillerato',
    'calculadora química',
    'balanceo estequiometrico',
    'síntesis combustión descomposición',
  ],
  openGraph: {
    title: 'Simulador de Reacciones Químicas | meskeIA',
    description: 'Estequiometría y reactivo limitante para 20 reacciones reales. Convierte gramos ↔ moles, calcula cantidades de todos los productos y reactivos.',
    url: 'https://meskeia.com/simulador-reacciones-quimicas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-reacciones-quimicas/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador de Reacciones Químicas",
  description: "Calculadora de estequiometría y reactivo limitante para 20 reacciones químicas reales. Dado X gramos o moles de una sustancia, calcula todos los demás. Encuentra el reactivo que agota primero y el ren",
  url: "https://meskeia.com/simulador-reacciones-quimicas/",
  category: 'EducationalApplication',
  features: [],
});
