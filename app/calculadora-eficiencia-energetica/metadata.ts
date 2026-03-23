import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Eficiencia Energética - Retorno Inversión Aislamiento y Ventanas | meskeIA',
  description: 'Calcula el ahorro en tu factura y el plazo de amortización de mejoras de eficiencia energética: aislamiento, ventanas, caldera y bomba de calor. Gratis y sin registro.',
  keywords: 'calculadora eficiencia energetica, retorno inversion aislamiento, ahorro ventanas doble acristalamiento, bomba de calor amortizacion, mejoras energeticas hogar, certificado energetico, ahorro factura luz calefaccion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Eficiencia Energética | meskeIA',
    description: 'Calcula el ahorro y amortización de mejoras energéticas en tu hogar: aislamiento, ventanas y calefacción.',
    url: 'https://meskeia.com/calculadora-eficiencia-energetica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Eficiencia Energética | meskeIA',
    description: 'Calcula en cuántos años se amortizan las mejoras energéticas de tu hogar.',
  },
  other: {
    'application-name': 'Calculadora Eficiencia Energética meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Eficiencia Energética',
  description: 'Herramienta gratuita para calcular el ahorro energético y el retorno de la inversión de mejoras en el hogar: aislamiento de tejado y paredes, ventanas de doble o triple acristalamiento, cambio de caldera y bomba de calor.',
  url: 'https://meskeia.com/calculadora-eficiencia-energetica/',
  features: [
    'Cálculo de ahorro anual con aislamiento de tejado y paredes',
    'Retorno de inversión en ventanas de doble y triple acristalamiento',
    'Comparativa caldera de gas vs bomba de calor',
    'Plazo de amortización (payback) en años',
    'Estimación de reducción de CO₂',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
