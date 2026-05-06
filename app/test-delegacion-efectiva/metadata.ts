import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Delegación Efectiva - ¿Delegas bien o solo sueltas tareas? | meskeIA',
  description: 'Descubre si delegas con acompañamiento y autonomía real o si microges­tionas o abandonas tareas. Test de 10 preguntas basado en el Modelo Situacional de Hersey-Blanchard. Gratuito y sin registro.',
  keywords: 'delegación efectiva, Hersey Blanchard, liderazgo situacional, delegar tareas, microgestión, management, autonomía equipo, feedback delegación, desarrollo equipo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Delegación Efectiva | meskeIA',
    description: '¿Delegas bien o solo sueltas tareas? Test interactivo basado en el Modelo Situacional de Hersey-Blanchard.',
    url: 'https://meskeia.com/test-delegacion-efectiva',
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
    title: 'Test de Delegación Efectiva | meskeIA',
    description: '¿Delegas con criterio o solo sueltas tareas? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test de Delegación Efectiva meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Delegación Efectiva',
  description: 'Herramienta interactiva de reflexión basada en el Modelo Situacional de Hersey-Blanchard. 10 preguntas para evaluar si delegas con acompañamiento y autonomía real. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/test-delegacion-efectiva/',
  features: [
    'Test de 10 preguntas sobre cómo delegas en tu equipo',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en el Modelo Situacional de Hersey-Blanchard',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu delegación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
