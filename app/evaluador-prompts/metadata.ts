import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Evaluador de Prompts - ¿Tus instrucciones a la IA son específicas o vagas? | meskeIA',
  description: 'Evalúa si sabes dar instrucciones claras a la IA y si aprovechas el resultado de forma crítica. Test de 10 preguntas sobre prompt engineering y uso efectivo de IA. Gratuito y sin registro.',
  keywords: 'evaluador prompts, prompt engineering, instrucciones IA, ChatGPT prompts, cómo hablar con IA, prompts efectivos, calidad prompts, iteración prompts, contexto IA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Evaluador de Prompts | meskeIA',
    description: '¿Tus instrucciones a la IA son específicas o vagas? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/evaluador-prompts',
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
    title: 'Evaluador de Prompts | meskeIA',
    description: '¿Sabes dar buenas instrucciones a la IA? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Evaluador de Prompts meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Evaluador de Prompts',
  description: 'Herramienta interactiva de reflexión sobre prompt engineering. 10 preguntas para evaluar la claridad de tus instrucciones a la IA y cómo procesas sus respuestas. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/evaluador-prompts/',
  features: [
    'Test de 10 preguntas sobre cómo interactúas con la IA',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa claridad de instrucciones y procesamiento de respuestas',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu prompt engineering',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
