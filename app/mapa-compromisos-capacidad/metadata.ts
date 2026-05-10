import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Compromisos vs Capacidad - ¿Has dicho sí a más de lo que puedes? | meskeIA',
  description: 'Descubre si tu carga de compromisos supera tu capacidad real. Test de 10 preguntas sobre sobrecarga y capacidad de gestión. Diagnóstico visual con perfil y acciones. Gratuito y sin registro.',
  keywords: 'compromisos vs capacidad, sobrecarga, decir que no, gestión compromisos, capacidad real, burnout, overcommitment, límites personales, carga de trabajo, planificación realista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Compromisos vs Capacidad | meskeIA',
    description: '¿Has dicho sí a más de lo que puedes hacer bien? Test interactivo de carga realista.',
    url: 'https://meskeia.com/mapa-compromisos-capacidad/',
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
    title: 'Mapa de Compromisos vs Capacidad | meskeIA',
    description: '¿Tu carga es sostenible? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Compromisos vs Capacidad meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Compromisos vs Capacidad',
  description: 'Herramienta interactiva de reflexión para evaluar si tu carga de compromisos es realista respecto a tu capacidad. Análisis de sobrecarga y gestión de límites.',
  url: 'https://meskeia.com/mapa-compromisos-capacidad/',
  features: [
    'Test de 10 preguntas sobre carga y capacidad',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en análisis de carga realista',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
