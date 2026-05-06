import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Comunicación Interna - ¿Rápido pero sin profundidad? | meskeIA',
  description: 'Evalúa si tu equipo comunica con velocidad y profundidad o sacrifica una por la otra. Test de 10 preguntas sobre comunicación organizacional. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'comunicación interna, comunicación equipo, velocidad vs profundidad, gestión información, Slack fatigue, documentación equipo, comunicación asincrónica, productividad comunicación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Comunicación Interna | meskeIA',
    description: '¿Tu equipo comunica rápido pero sin profundidad? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/diagnostico-comunicacion-interna',
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
    title: 'Diagnóstico de Comunicación Interna | meskeIA',
    description: '¿Tu equipo comunica rápido pero sin profundidad? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Comunicación Interna meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Comunicación Interna',
  description: 'Herramienta interactiva de reflexión sobre comunicación organizacional. 10 preguntas para evaluar si tu equipo equilibra velocidad y profundidad al comunicar. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-comunicacion-interna/',
  features: [
    'Test de 10 preguntas sobre cómo comunica tu equipo',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa velocidad y profundidad de la comunicación',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar la comunicación interna',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
