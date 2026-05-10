import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Estancamiento Profesional - ¿Estás en zona de confort, estrés o flujo? | meskeIA',
  description: 'Descubre si estás en zona de confort, estrés o flujo profesional. Test interactivo de 10 preguntas basado en el modelo de flujo de Csikszentmihalyi. Gratuito y sin registro.',
  keywords: 'estancamiento profesional, zona de confort, estado de flujo, Csikszentmihalyi, flow, estrés laboral, diagnóstico carrera, desarrollo profesional, motivación trabajo, crecimiento profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Estancamiento Profesional | meskeIA',
    description: '¿Estás en zona de confort, estrés o flujo? Test interactivo basado en Csikszentmihalyi.',
    url: 'https://meskeia.com/diagnostico-estancamiento-profesional/',
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
    title: 'Diagnóstico de Estancamiento Profesional | meskeIA',
    description: '¿Estás en zona de confort, estrés o flujo? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Estancamiento Profesional meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Estancamiento Profesional',
  description: 'Herramienta interactiva de reflexión para evaluar si estás en zona de confort, estrés o flujo profesional. Basado en el modelo de flujo de Mihaly Csikszentmihalyi. 10 preguntas, resultado visual con perfil y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-estancamiento-profesional/',
  features: [
    'Test de 10 preguntas sobre tu situación profesional actual',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el modelo de flujo de Csikszentmihalyi',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
