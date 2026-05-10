import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Modelo de Negocio - ¿Los pilares de tu negocio están equilibrados? | meskeIA',
  description: 'Descubre si tu modelo de negocio está equilibrado. Test de 10 preguntas basado en el Business Model Canvas simplificado. Evalúa propuesta de valor y sostenibilidad. Gratuito y sin registro.',
  keywords: 'modelo de negocio, Business Model Canvas, diagnóstico negocio, propuesta de valor, sostenibilidad, emprendimiento, negocio viable, ingresos, cliente, estrategia negocio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Modelo de Negocio | meskeIA',
    description: '¿Tu modelo de negocio está equilibrado? Test basado en el Business Model Canvas.',
    url: 'https://meskeia.com/diagnostico-modelo-negocio/',
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
    title: 'Diagnóstico de Modelo de Negocio | meskeIA',
    description: '¿Los pilares de tu negocio están equilibrados? Descúbrelo gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Modelo de Negocio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Modelo de Negocio',
  description: 'Herramienta interactiva de reflexión para evaluar si tu modelo de negocio está equilibrado. Basado en el Business Model Canvas simplificado de Osterwalder.',
  url: 'https://meskeia.com/diagnostico-modelo-negocio/',
  features: [
    'Test de 10 preguntas sobre propuesta y sostenibilidad',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en el Business Model Canvas',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
