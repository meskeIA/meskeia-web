import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Tolerancia al Riesgo Detallado | meskeIA',
  description: 'Evaluación profunda de tu perfil inversor en 5 dimensiones: horizonte temporal, capacidad financiera, reacción emocional, experiencia y objetivos. 20 preguntas, 5 perfiles con asignación de activos recomendada.',
  keywords: [
    'test tolerancia al riesgo inversor',
    'perfil de riesgo inversión',
    'cuestionario inversor',
    'horizonte temporal inversión',
    'perfil conservador moderado agresivo',
    'asignación activos cartera',
    'renta fija renta variable',
    'psicología del inversor',
    'test finanzas personales',
    'finanzas conductuales',
  ],
  openGraph: {
    title: 'Test de Tolerancia al Riesgo Detallado | meskeIA',
    description: '20 preguntas en 5 dimensiones para conocer tu perfil inversor real: capacidad financiera, reacción emocional, experiencia y objetivos.',
    url: 'https://meskeia.com/test-tolerancia-riesgo-detallado/',
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
    canonical: 'https://meskeia.com/test-tolerancia-riesgo-detallado/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Tolerancia al Riesgo Detallado",
  description: "Evaluación profunda de tu perfil inversor en 5 dimensiones: horizonte temporal, capacidad financiera, reacción emocional, experiencia y objetivos. 20 preguntas, 5 perfiles con asignación de activos re",
  url: "https://meskeia.com/test-tolerancia-riesgo-detallado/",
  category: 'FinanceApplication',
  features: [],
});
