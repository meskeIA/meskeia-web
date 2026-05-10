import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Multitarea - ¿Tu multitarea es productiva o destructiva? | meskeIA',
  description: 'Descubre si tu forma de hacer multitarea te ayuda o te perjudica. Test de 10 preguntas sobre fragmentación y foco. Basado en investigación sobre context-switching. Gratuito y sin registro.',
  keywords: 'multitarea, context switching, fragmentación atención, foco, concentración, productividad, deep work, atención dividida, cambio de contexto, multitasking',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Multitarea | meskeIA',
    description: '¿Tu multitarea es productiva o destructiva? Test interactivo sobre context-switching.',
    url: 'https://meskeia.com/diagnostico-multitarea/',
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
    title: 'Diagnóstico de Multitarea | meskeIA',
    description: '¿La multitarea te ayuda o te perjudica? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Multitarea meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Multitarea',
  description: 'Herramienta interactiva de reflexión para evaluar si tu multitarea es productiva o destructiva. Basado en investigación sobre context-switching y atención dividida.',
  url: 'https://meskeia.com/diagnostico-multitarea/',
  features: [
    'Test de 10 preguntas sobre fragmentación y foco',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en investigación sobre context-switching',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
