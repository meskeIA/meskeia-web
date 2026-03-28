import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Préstamo — ¿Qué financiación te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de préstamo o financiación te conviene: personal, hipotecario, de consumo, línea de crédito o microcrédito. Análisis según finalidad, importe, garantías y situación económica.',
  keywords: [
    'qué préstamo pedir',
    'préstamo personal o hipotecario',
    'crédito al consumo España',
    'financiación sin aval',
    'línea de crédito o préstamo',
    'microcrédito autónomo',
    'préstamo para coche o reforma',
    'cómo financiar un proyecto',
    'tipos de préstamos España',
    'cuánto préstamo puedo pedir',
  ],
  openGraph: {
    title: '¿Préstamo personal, hipotecario o línea de crédito? | meskeIA',
    description:
      'Descubre qué tipo de financiación se adapta mejor a tu situación, finalidad e importe necesario.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-prestamo/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de préstamo te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre préstamo personal, hipotecario, consumo, línea de crédito o microcrédito.',
  },
  alternates: { canonical: 'https://meskeia.com/selector-tipo-prestamo/' },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Préstamo',
        description:
          'Test orientativo para saber qué tipo de financiación (personal, hipotecario, consumo, línea de crédito o microcrédito) se adapta mejor a la situación y necesidades.',
        url: 'https://meskeia.com/selector-tipo-prestamo/',
        features: [
          'Test de 10 preguntas sobre situación financiera',
          '5 opciones: personal, hipotecario, consumo, línea crédito, microcrédito',
          'Análisis de importe, garantías y capacidad de pago',
          'Alertas sobre sobreendeudamiento',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};
