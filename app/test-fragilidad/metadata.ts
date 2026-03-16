import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test de Fragilidad (Escala FRAIL) - Evaluación para mayores | meskeIA',
  description: 'Test validado de 5 preguntas basado en la escala FRAIL para detectar fragilidad en personas mayores. Orientación preventiva sobre riesgo de caídas, dependencia y pérdida de autonomía.',
  keywords: 'test fragilidad mayores, escala FRAIL, fragilidad anciano, sarcopenia test, prevencion dependencia mayores, test pre-fragilidad, criterios Fried fragilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Fragilidad (Escala FRAIL) | meskeIA',
    description: 'Test validado de 5 ítems para evaluar el riesgo de fragilidad en personas mayores.',
    url: 'https://meskeia.com/test-fragilidad/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Fragilidad (Escala FRAIL) | meskeIA',
    description: 'Detección precoz de fragilidad en mayores con la escala FRAIL validada',
  },
  other: {
    'application-name': 'Test Fragilidad FRAIL meskeIA',
  },
};
