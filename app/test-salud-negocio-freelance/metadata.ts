import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Salud de tu Negocio Freelance | meskeIA',
  description: 'Evalúa tu negocio freelance en 5 dimensiones: finanzas, clientes, eficiencia, equilibrio vida-trabajo y crecimiento. Radar chart con recomendaciones.',
  keywords: 'test freelance, salud negocio, diagnóstico freelance, autónomo, evaluación negocio, radar chart, freelance España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Salud de tu Negocio Freelance | meskeIA',
    description: 'Evalúa 5 dimensiones clave de tu negocio freelance y descubre dónde mejorar con recomendaciones personalizadas.',
    url: 'https://meskeia.com/test-salud-negocio-freelance/',
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
    title: 'Test de Salud de tu Negocio Freelance | meskeIA',
    description: 'Evalúa 5 dimensiones clave de tu negocio freelance y descubre dónde mejorar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Test Salud Negocio Freelance meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Salud de tu Negocio Freelance',
  description: 'Test interactivo de 15 preguntas que evalúa tu negocio freelance en 5 dimensiones: estabilidad financiera, diversificación de clientes, eficiencia operativa, equilibrio vida-trabajo y crecimiento profesional. Incluye radar chart y recomendaciones personalizadas.',
  url: 'https://meskeia.com/test-salud-negocio-freelance/',
  features: [
    'Evaluación en 5 dimensiones clave del negocio freelance',
    'Radar chart interactivo con resultados visuales',
    'Recomendaciones personalizadas con enlaces a herramientas',
    'Puerta de entrada a la suite freelance completa de meskeIA',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
