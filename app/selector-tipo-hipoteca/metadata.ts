import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Hipoteca | ¿Fija, Variable o Mixta? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de hipoteca se adapta mejor a tu situación: hipoteca fija, variable, mixta o hipoteca verde para vivienda eficiente.',
  keywords: [
    'hipoteca fija o variable',
    'qué tipo de hipoteca elegir',
    'hipoteca mixta España',
    'hipoteca verde vivienda eficiente',
    'interés fijo variable hipoteca',
    'euríbor hipoteca variable',
    'hipoteca primer piso España',
    'cuota fija o variable hipoteca',
    'tipo hipoteca según perfil',
    'simulador hipoteca España',
  ],
  openGraph: {
    title: 'Selector de Tipo de Hipoteca — ¿Fija, Variable o Mixta?',
    description:
      'Descubre qué tipo de hipoteca se adapta mejor a tu perfil en 10 preguntas.',
    url: 'https://meskeia.com/selector-tipo-hipoteca/',
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
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Hipoteca",
  description: "Test de 10 preguntas para saber qué tipo de hipoteca se adapta mejor a tu situación: hipoteca fija, variable, mixta o hipoteca verde para vivienda eficiente.",
  url: "https://meskeia.com/selector-tipo-hipoteca/",
  category: 'FinanceApplication',
  features: [],
});
