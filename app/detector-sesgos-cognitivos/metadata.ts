import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Detector de Sesgos Cognitivos - ¿Qué sesgos afectan tus decisiones? | meskeIA',
  description: 'Descubre qué sesgos cognitivos pueden estar afectando tus decisiones. Test de 10 preguntas basado en Kahneman (Sistema 1 y 2). Evalúa automatismo y deliberación. Gratuito y sin registro.',
  keywords: 'sesgos cognitivos, Kahneman, Sistema 1 Sistema 2, pensamiento rápido lento, decisiones, heurísticas, sesgo confirmación, sesgo anclaje, pensamiento crítico, racionalidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Detector de Sesgos Cognitivos | meskeIA',
    description: '¿Qué sesgos afectan tus decisiones? Test basado en Kahneman (Sistema 1 y 2).',
    url: 'https://meskeia.com/detector-sesgos-cognitivos/',
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
    title: 'Detector de Sesgos Cognitivos | meskeIA',
    description: '¿Decides bien o decides rápido? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Detector de Sesgos Cognitivos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Detector de Sesgos Cognitivos',
  description: 'Herramienta interactiva de reflexión para detectar sesgos cognitivos en tu proceso de decisión. Basado en el trabajo de Daniel Kahneman sobre Sistema 1 (rápido) y Sistema 2 (lento).',
  url: 'https://meskeia.com/detector-sesgos-cognitivos/',
  features: [
    'Test de 10 preguntas sobre automatismo y deliberación',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en Kahneman: Sistema 1 y Sistema 2',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
