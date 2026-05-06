import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Dependencia de Clientes - ¿Tu negocio depende de pocos clientes? | meskeIA',
  description: 'Descubre si tu negocio tiene una dependencia peligrosa de pocos clientes. Test de 10 preguntas sobre concentración de riesgo y diversificación. Diagnóstico visual con perfil y acciones. Gratuito.',
  keywords: 'dependencia clientes, concentración riesgo, diversificación clientes, cartera clientes, cliente principal, riesgo negocio, freelance clientes, autónomo dependencia, gestión cartera, riesgo concentración',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Dependencia de Clientes | meskeIA',
    description: '¿Tu negocio depende demasiado de pocos clientes? Test interactivo de concentración de riesgo.',
    url: 'https://meskeia.com/mapa-dependencia-clientes',
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
    title: 'Mapa de Dependencia de Clientes | meskeIA',
    description: '¿Tu negocio depende de pocos clientes? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Mapa de Dependencia de Clientes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Dependencia de Clientes',
  description: 'Herramienta interactiva de reflexión para evaluar si tu negocio o actividad profesional depende demasiado de pocos clientes. Análisis de concentración de riesgo y capacidad de diversificación.',
  url: 'https://meskeia.com/mapa-dependencia-clientes/',
  features: [
    'Test de 10 preguntas sobre tu cartera de clientes',
    'Diagnóstico visual con mapa 2D y perfil personalizado',
    'Basado en análisis de concentración de riesgo empresarial',
    'Acciones concretas según tu resultado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
