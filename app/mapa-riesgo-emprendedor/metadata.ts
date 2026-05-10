import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Riesgo del Emprendedor - ¿Qué pasa si no funciona? | meskeIA',
  description: 'Descubre si estás gestionando bien los riesgos de emprender. Test de 10 preguntas sobre exposición al riesgo y preparación. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'riesgo emprendedor, gestión riesgo, plan B, emprender riesgos, colchón financiero, riesgo calculado, fracaso emprendedor, preparación emprendimiento, resiliencia emprendedor, análisis riesgos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Riesgo del Emprendedor | meskeIA',
    description: '¿Qué pasa si tu proyecto no funciona? ¿Lo has pensado? Test interactivo.',
    url: 'https://meskeia.com/mapa-riesgo-emprendedor/',
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
    title: 'Mapa de Riesgo del Emprendedor | meskeIA',
    description: '¿Tienes plan B? Evalúa tus riesgos con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Mapa de Riesgo del Emprendedor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Riesgo del Emprendedor',
  description: 'Herramienta interactiva de reflexión para evaluar si estás gestionando bien los riesgos de emprender. Análisis de exposición y preparación ante el fracaso.',
  url: 'https://meskeia.com/mapa-riesgo-emprendedor/',
  features: ['Test de 10 preguntas sobre exposición y preparación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en análisis de riesgos personales', 'Acciones concretas según tu resultado', 'Funciona 100% en el navegador, sin registro ni instalación', 'Gratuito y sin publicidad', 'Disponible en español'],
});
